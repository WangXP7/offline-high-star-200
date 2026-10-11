// INKWAVE online relay (Cloudflare Worker + Durable Object).
//
//   GET /room/<CODE>?name=<name>&create=1&v=<proto>   (WebSocket upgrade) → the Room object for that code
//   GET /health                                          → "ok"
//
// A Room is a dumb, fast fan-out: game payloads are forwarded as raw strings (never parsed here). The room only
// tracks membership (id, name, join order), elects the host (the oldest member), and refuses joins that can't work
// (unknown code, full, match in progress). Wire format, client → room:
//   "b|<payload>"          broadcast to everyone else          "s|<toId>|<payload>"   to one member
//   {"t":"lock","v":bool}  host: refuse new joins while a match runs
//   "ping"                 → "pong" (answered by the runtime without waking the room; also the liveness signal)
//   {"t":"ping","c":n}     → {"t":"pong","c":n}   (older clients)
// room → client:
//   "m|<fromId>|<payload>"                                      relayed game payload
//   {"t":"welcome","id","host","members":[{id,name}]}           {"t":"join","m":{id,name}}
//   {"t":"leave","id","host"}                                   {"t":"err","e":"…"} (then close)
import { DurableObject } from 'cloudflare:workers';

const PROTO = 1, MAX = 8;
// Public relay hygiene: only the game's own site may open rooms (plus local dev), each socket gets a message budget
// (the game sends ~25/s; a runaway or hostile client is cut off before it can eat the account's quota) and a size cap.
const ORIGIN_OK = (o) => /^https:\/\/([a-z0-9-]+\.)?inkwave-aah\.pages\.dev$/.test(o)
  || /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[a-z0-9-]+\.local)(:\d+)?$/.test(o);   // dev + LAN play
const MSG_MAX = 65536, RATE = 90, BURST_STRIKES = 4;
// A socket whose "ping"s stop is a player whose connection died without closing (Wi-Fi gone, laptop lid shut): drop
// them so their squidkid is handed to a bot instead of standing frozen. Clients ping every 2 s; a hidden tab still
// pings (throttled to ≥ 1/min after five minutes), so the lobby allowance is generous.
const SILENT_MATCH = 20000, SILENT_LOBBY = 150000, SWEEP = 4000;   // a heavy transition on a slow machine can freeze a tab for seconds
const CODE = /^[A-Z0-9]{4,8}$/;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/health') return new Response('ok', { headers: { 'access-control-allow-origin': '*' } });
    const m = url.pathname.match(/^\/room\/([A-Za-z0-9]+)$/);
    if (!m) return new Response('INKWAVE relay', { status: 404 });
    const code = m[1].toUpperCase();
    if (!CODE.test(code)) return new Response('bad code', { status: 400 });
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
    if (!ORIGIN_OK(req.headers.get('Origin') || '')) return new Response('forbidden', { status: 403 });
    return env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(req);
  },
};

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.locked = false;
    this.seq = 0;
    this.seen = new Map();   // ws → last message time (in memory: a busy room never hibernates; a quiet one has the pings)
    this.rate = new Map();   // ws → { t: window start, n: messages in it, strikes }
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
    // hibernation: rebuild the join counter from surviving sockets
    for (const ws of this.ctx.getWebSockets()) { const a = ws.deserializeAttachment(); if (a && a.seq >= this.seq) this.seq = a.seq + 1; }
  }

  members() {
    return this.ctx.getWebSockets().map((ws) => ({ ws, a: ws.deserializeAttachment() })).filter((m) => m.a && !m.a.gone).sort((x, y) => x.a.seq - y.a.seq);
  }
  host() { const ms = this.members(); return ms.length ? ms[0].a.id : null; }

  async fetch(req) {
    const url = new URL(req.url);
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    // `c` is the machine-readable error code (mirrors ERR in ../../src/net/errors.js — the worker is bundled on its
    // own, so the four literals are duplicated here on purpose); `e` stays for older clients and for logs.
    const fail = (c, e) => { server.send(JSON.stringify({ t: 'err', c, e })); server.close(4000, e); return new Response(null, { status: 101, webSocket: client }); };
    const ms = this.members().filter((m) => m.ws !== server);
    const create = url.searchParams.get('create') === '1';
    if (+(url.searchParams.get('v') || 0) !== PROTO) return fail('ERR_STALE', 'Please refresh the page — the game was updated');
    if (create && ms.length) return fail('ERR_CODE_TAKEN', 'Room code taken');
    if (!create && !ms.length) return fail('ERR_NOT_FOUND', 'Room not found');
    if (ms.length >= MAX) return fail('ERR_FULL', 'Room is full');
    if (this.locked && ms.length) return fail('ERR_IN_PROGRESS', 'Match in progress');
    if (!ms.length) this.locked = false;
    const name = (url.searchParams.get('name') || 'Player').replace(/[^\p{L}\p{N} ._\-!?']/gu, '').slice(0, 16) || 'Player';
    let id;
    do { id = Math.random().toString(36).slice(2, 6).toUpperCase(); } while (ms.some((m) => m.a.id === id));
    const a = { id, name, seq: this.seq++, at: Date.now() };
    server.serializeAttachment(a);
    const all = [...ms.map((m) => m.a), a];
    server.send(JSON.stringify({ t: 'welcome', id, host: all[0].id, members: all.map(({ id, name }) => ({ id, name })) }));
    const j = JSON.stringify({ t: 'join', m: { id, name } });
    for (const m of ms) try { m.ws.send(j); } catch { /* closing */ }
    if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(Date.now() + SWEEP);
    return new Response(null, { status: 101, webSocket: client });
  }

  // liveness sweep (only while the room has members)
  async alarm() {
    const now = Date.now(), limit = this.locked ? SILENT_MATCH : SILENT_LOBBY;
    for (const m of this.members()) {
      const seen = Math.max(m.a.at || 0, this.seen.get(m.ws) || 0, this.ctx.getWebSocketAutoResponseTimestamp(m.ws)?.getTime() || 0);
      if (now - seen > limit) { try { m.ws.close(4001, 'Connection timed out'); } catch { /* gone */ } this._gone(m.ws); }
    }
    if (this.members().length) await this.ctx.storage.setAlarm(Date.now() + SWEEP);
  }

  async webSocketMessage(ws, msg) {
    if (typeof msg !== 'string') return;
    const me = ws.deserializeAttachment();
    if (!me) return;
    const now = Date.now();
    this.seen.set(ws, now);
    if (msg.length > MSG_MAX) return;                                   // oversized: dropped, never fanned out
    let r = this.rate.get(ws);
    if (!r) this.rate.set(ws, (r = { t: now, n: 0, strikes: 0 }));
    if (now - r.t >= 1000) { r.strikes = r.n > RATE ? r.strikes + 1 : Math.max(0, r.strikes - 1); r.t = now; r.n = 0; }
    if (++r.n > RATE * 3 || r.strikes >= BURST_STRIKES) { try { ws.close(4008, 'Too many messages'); } catch { /* gone */ } this._gone(ws); return; }
    const c = msg.charCodeAt(0);
    if (c === 98 /* b */ && msg.charCodeAt(1) === 124) {
      const out = 'm|' + me.id + '|' + msg.slice(2);
      for (const s of this.ctx.getWebSockets()) if (s !== ws) try { s.send(out); } catch { /* closing */ }
      return;
    }
    if (c === 115 /* s */ && msg.charCodeAt(1) === 124) {
      const k = msg.indexOf('|', 2);
      if (k < 0) return;
      const to = msg.slice(2, k), out = 'm|' + me.id + '|' + msg.slice(k + 1);
      for (const s of this.ctx.getWebSockets()) { const a = s.deserializeAttachment(); if (a && a.id === to) { try { s.send(out); } catch { /* closing */ } break; } }
      return;
    }
    if (c === 123 /* { */) {
      let o; try { o = JSON.parse(msg); } catch { return; }
      if (o.t === 'ping') ws.send(JSON.stringify({ t: 'pong', c: o.c }));
      else if (o.t === 'lock' && this.host() === me.id) this.locked = !!o.v;
    }
  }

  async webSocketClose(ws) { this._gone(ws); }
  async webSocketError(ws) { this._gone(ws); }

  _gone(ws) {
    this.seen.delete(ws); this.rate.delete(ws);
    const a = ws.deserializeAttachment();
    if (!a || a.gone) return;
    a.gone = true;
    try { ws.serializeAttachment(a); } catch { /* already closed */ }
    const host = this.host();
    const out = JSON.stringify({ t: 'leave', id: a.id, host });
    for (const m of this.members()) try { m.ws.send(out); } catch { /* closing */ }
    if (!this.members().length) this.locked = false;
  }
}
