// Net error codes — the single source of truth for *logic*.
//
// Room failures used to travel as English sentences that doubled as lookup keys (`e.message !== 'Room code taken'`,
// `JOIN_ERR[msg]`). That couples behaviour to wording, so translating a message could silently break the retry loop
// or the error screen. Now every failure carries a stable `code` (these constants) plus an optional English
// `message` kept only for logs; the player-facing wording lives in the i18n dictionaries
// (the message-id table `JOIN_ERR` in src/ui/menus.js).
//
// The relay (server/src/index.js) sends the same codes in its `err` frame (`c`), with the old text still in `e` so an
// older relay — or a newer one talking to an older client — keeps working: `codeFromRelay` maps the legacy text back
// to a code when no `c` is present.
export const ERR = {
  STALE: 'ERR_STALE',            // the page is running an older build than the relay
  CODE_TAKEN: 'ERR_CODE_TAKEN',  // create: that 5-character code is already in use
  NOT_FOUND: 'ERR_NOT_FOUND',    // join: no room with that code
  FULL: 'ERR_FULL',              // join: the room already has eight players
  TEAM_FULL: 'ERR_TEAM_FULL',    // lobby: the team we asked to switch to is full
  IN_PROGRESS: 'ERR_IN_PROGRESS',// join: the room is mid-match
  CONNECT: 'ERR_CONNECT',        // the socket never opened (offline, blocked, relay down)
  LOST: 'ERR_LOST',              // the socket dropped after we were in
  MATCH_START: 'ERR_MATCH_START',// the host's start-match handshake failed
};

/** An Error carrying a machine-readable `code`. `message` is a log/debug fallback only — never compare on it. */
export function netError(code, message = '') {
  const e = new Error(message || code);
  e.code = code;
  e.name = 'NetError';
  return e;
}

// Relay text -> code, for frames that predate the `c` field (and for socket close reasons, which are text by spec).
const LEGACY = {
  'Room code taken': ERR.CODE_TAKEN,
  'Room not found': ERR.NOT_FOUND,
  'Room is full': ERR.FULL,
  'Match in progress': ERR.IN_PROGRESS,
  'Could not connect': ERR.CONNECT,
  'Lost connection to the room': ERR.LOST,
  'Could not start the match': ERR.MATCH_START,
  'Disconnected': ERR.LOST,
};

/** Map a legacy relay/close message to a code (null when we don't recognise it). */
export function codeFromText(text) {
  return LEGACY[text] || null;
}

/** Code for a relay `err` frame: the explicit `c` code wins, else the legacy text, else a generic connect failure. */
export function codeFromRelay(c, text) {
  return c || codeFromText(text) || ERR.CONNECT;
}
