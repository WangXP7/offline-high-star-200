// Story chapters: the registry (campaign order) and THE chapter format. One module per chapter, src/story/<id>.js, named
// by id (the campaign runs in historical order, so 定軍山 is chapter IV). Everything a chapter needs is data in its own
// module: the director (index.js), prologue (prologue.js), result (result.js), title / select / loading screens read it.
// Progress (core/progress.js: records per stage × officer × difficulty): chapter i is open once chapter i-1 is cleared
// (the first always is); what else the records open is that module's UNLOCKS.
// Trials (./trials.js TRIALS) are battles in this same format without a prologue; chapter(id) finds either kind, and
// the flow's ctx.mode ('story' | 'trial' | 'free') says which kind a battle is.
//
// ---- export const CH (metadata)
//   id        'hulao'                              module / progress key; ctx.ch everywhere (flow, scenario event, ?ch=)
//   num       { zh: '第一章', en: 'CHAPTER I' }     title  { zh: '虎牢關', en: 'Hulao Gate' }
//   seal      '討董之戰'                            red seal on the prologue stamp / title card (2-4 glyphs)
//   era       { zh: '初平元年', en: '190 AD' }      title chapter card, prologue context
//   map       'dingjun'                            world map id (src/world/maps, C1); the battle loads it
//   heroes    ['liubei', 'guanyu', 'zhangfei']     story roster: select offers only these (ids not in CHARS yet are
//                                                  hidden); every hero-branched line / card / epilogue covers each
//   ally      { heroId: allyId }                   the 'ally' speaker per hero (a CHARS id; missing = 'ally' lines skipped)
//   army      { foe: 'dong', ally: 'liu' }         crowd army ids (src/crowd/armies.js, C3): flags, colours, morale glyphs
//   van       [{ x, z, n, cols, hold }]            allied blocks at the start (crowd.spawnAllies args, world metres)
//   start?    { x, z, yaw, tilt }                  hero start; omitted = the map's story spawn (spawnPoint('story'))
//   hq        [x, z]                               minimap enemy 本陣 marker
//   rank      { kos: [a, b, c], time: [a, b, c] }  rank points: kos ≥ a/b/c → 1/2/3, clear time (s) ≤ c/b/a → 1/2/3
//                                                  (+ damage taken 0-3, + game.diff.rankBonus; S ≥ 8, A ≥ 6, B ≥ 4)
//             s? { time?, kos?, dmg }              extra S gate: time ≤ seconds, kos ≥ count, dmg ≤ max HP × fraction
//
// ---- export const SPK = { key: { name: { zh, en }, seal: '劉', side: 'shu' | 'wei', char?: CHARS id } }
//   non-player speakers: a seal portrait, or the pixel portrait when `char` (or the key itself) is a CHARS id. side
//   'wei' = the foe's colours in the dialogue panel (any enemy army), 'shu' = ours.
// ---- export const OFF = { key: { name: { zh, en }, hp, boss?, look? } }
//   crowd officers (crowd.spawnOfficer). hp: 520 ≈ 5 full combos, a commander ≈ 2400; boss: no generic KO banner (the
//   script announces him). look: per-officer palette (C3). Beats spawn them by key (or `like` another key's stats).
//
// ---- export const BEATS = [beat, ...]  (DW8 story battle: a linear script)
// The director fires beat k once its `when` holds, and only after beat k-1 fired, so running ahead or doubling back never
// reorders or skips the script. Maps run along +Z (the hero advances toward +Z; `zone` / `at` / `limit` compare z).
//   when   trigger: object (every key must hold) or [object, ...] (any one holds). Omitted = at once. Keys:
//            wait: n         sim frames (60/s) since the previous beat      kos: n    hero KOs since the previous beat
//            zone: id        hero reached that zone (z ≥ its near edge)     at: P     hero reached the z of position P
//            near: [P, r]    hero within r metres of P (2D)
//            down: key       that officer / actor was KO'd (an actor that retreats counts as down)
//            below: [key, f] / hp: [key, f]   that officer's / actor's / defend point's HP fraction < f
//            timer: true     the objective timer (obj.timer) ran out
//            hero: [ids]     the hero is one of these (use in skip, or one branch of an any-of)
//   skip   trigger: when it holds as the beat comes up, the beat is dropped (a line that no longer makes sense)
//   hero   [ids]: the beat only runs for these heroes (dropped for the others)
//   Effects (applied in this order when the beat fires):
//   win    victory: slow-mo, then the result screen          retire   free idle foe grunts far behind the hero
//   squads [{ at: P, n, cols?, charge? }]                     foe blocks (charge: they run at the hero at once)
//   officers { key: { at: P, engaged?, like? } }              OFF officers (spawned as soon as a crowd slot is free)
//   actors { key: { kit, role, at: P, yaw?, hp?, name?, seal?, poise?, attacks?, scale?, retreatAt?, intro? } }
//            hero-model NPCs (C5 game.actors.spawn; role 'boss' | 'ally' | 'npc'); ignored until that lane is in
//   actor  { key, do: 'retreat' | 'join' | 'hold' | 'follow', at?: P } (or a list)   order an actor
//   army   true: the free battle's army round the arena (crowd.spawnArmy: blocks, the foe army's officers, waves on);
//            a trial's first beat fields it at reset under loading; firing the beat never fields it twice
//   waves  true / false: foe reinforcement columns on / off
//   limit  { z: P | null, back?: P, nag?: line }  stage bounds: the hero can't pass z(P) (null = open), nor fall back
//            behind back(P) (out-and-back chapters); nag is said (≤ every 10 s) when he pushes the bound
//   heal f fraction of max HP (× game.diff.heal)   morale ±d (1 = full)   gate: id  open a map gate (all shut at start)
//   banner { html, en, dur?, big? }   system band (html may use <em>; big: the commander / chapter banners)
//   hush   drop dialogue still queued (a stage just fell: its officer's taunts are stale)
//   obj    { zh, en, go?: officer / actor key | P, timer?: s, keepTimer?: true } objective (HUD top left; go = the HUD arrow target;
//            timer = a countdown on it, `timer: true` triggers when it runs out; a new obj replaces the timer unless
//            keepTimer preserves the current countdown while a temporary objective is shown)
//   fail   { when: trigger, zh, en } | null   arm a defeat condition (checked every step until replaced / null):
//            its line is bannered, 2 s later the battle is lost with that reason (result screen)
//   defend { key, at: P, r, hp, name: { zh, en } } | null   a point the foe drains while standing within r metres
//            (1 hp per soldier-second × game.diff.dmg; HUD bar under the minimap); hp: [key, f] / below read it
//   set    'name'   a map set-piece change (emits story:set {id}; the map's build().sets[name]() runs, C1)
//   buff   { atk?, def?, dur?, zh?, en? }   hero multipliers: damage dealt × atk, damage taken ÷ def, for dur seconds
//            (omitted = the rest of the battle); zh/en = its banner (e.g. 青釭劍)
//   say    [line, ...]   dialogue, queued one at a time (~3-4.5 s each)
// Position P = [zoneId, fx, fz] (fractions of the zone's half width / depth, or radius, from its centre),
// [anchorId, dx, dz] (metres from a map anchor, C1 map.anchors) or ['hero', dx, dz] (metres from where the hero stands
// as it is read): the script follows the map's tables, no hard geometry.
// Line = { who, zh?, en?, [heroId]: [zh, en] ... }: the hero's branch if any, else zh / en; a line with neither for the
//   current hero is skipped (never an error). who: 'hero' | 'ally' (CH.ally[hero]) | an SPK key | a CHARS id (pixel
//   portrait; the current hero's own id = 'hero'). A speaker that resolves to nothing is skipped too.
//
// ---- export const PROLOGUE = [card, ...]  (prologue.js: ink-scroll cards over PL_MAP, then the CH stamp; ≤ 10 cards)
//   { cols: [3 short vertical brush columns], en, show: [PL_MAP data-ids drawn in on this card], focus: [x, y, zoom] }
//   (focus in PL_MAP viewBox units; zoom ≈ 1.04-1.45). Branch: { [heroId]: { cols, en }, ..., show, focus } — a hero with
//   no branch falls back to the card's own cols / en, or the card is skipped.
// ---- export const PL_MAP = { art, arrows }   the prologue's ink map, viewBox 1600 × 900 (sepia paper, grain, vignette
//   and the arrow ink are the prologue's own)
//   art     SVG markup: terrain drawn under the paper grain (class pl-mark + data-id = lit by a card's show) and ONE
//           <g class="pl-labels"> of place names (<g class="pl-mark [wei]" data-id><rect/>?<text [class="sm|river"]/></g>),
//           which is lifted above the arrows; the drift keeps every lit label on screen. dingjun.js has a peaks() helper.
//   arrows  [[data-id, 'shu' | 'wei', 'M x y C x y x y x y']]: troop arrows, ours teal / the foe vermilion, drawn in on show
// ---- export const EPILOGUE = { [heroId]: { zh: [lines], en: [lines] } }   result screen after a win (missing hero =
//   the first entry)
import * as hulao from './hulao.js';
import * as changban from './changban.js';
import * as chibi from './chibi.js';
import * as dingjun from './dingjun.js';
import { TRIALS } from './trials.js';
import { cleared } from '../core/progress.js';

export const CHAPTERS = [hulao, changban, chibi, dingjun];
/** Chapter or trial module by id (unknown / missing id = the first chapter). */
export const chapter = (id) => CHAPTERS.find((m) => m.CH.id === id) || TRIALS.find((m) => m.CH.id === id) || CHAPTERS[0];
/** Chapter i (index into CHAPTERS) is playable: the first always, the others once the one before is cleared. */
export const chapterOpen = (i) => i === 0 || !!cleared(CHAPTERS[i - 1].CH.id);
