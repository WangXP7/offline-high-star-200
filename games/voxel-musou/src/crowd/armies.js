// Armies (C3): the factions a battle fields, as pure data (sim-safe, no THREE). A battle picks one foe and one ally army
// (main.js startBattle: game.army = armyPair(chapter CH.army | FREE_ARMY) = { foe, ally }, set before the crowd view is
// rebuilt and before 'scenario'). Readers: crowd/view.js (soldier / officer palettes, weapons, standards, emissive
// accents — the view is rebuilt when the pair changes), crowd/crowd.js (free-mode officers), vfx.js (KO debris),
// ui/hud.js (morale glyphs / colours, wave banners, minimap), the map dressing kit (k.army: field banners).
//
// An army: name {zh, en} · glyph (standard / morale character) · flag (standard cloth) · ink (glyph colour on it, default
// dark) · ui (HUD colour: minimap dots, morale bar, pings) · glow [red, green, blue, purple] (emissive gain of that
// accent hue on the crowd material; the pair takes the max per hue, so a faction's headbands / tassels read as a
// pattern at distance and at night) · grunt / officer (palette overrides on GRUNT / OFFICER below) · officers (free-mode
// named officers, slot order: {zh, en, look?}).
// Officer look (chapter OFF.k.look / officers[k].look, per officer slot: crowd.offLook): { armor, trim, cape, plume
// (0xRRGGBB, each optional; armor derives plate / highlight / lacing / helmet, trim the rivets / helmet trim / buckle,
// cape its fold shade), helm: 'wing' | 'horn' | 'crest' | 'cap' }.
//   wing  (default) lacquered helmet with side wings, tall plume + a plume swept back
//   horn  crescent horns over the brow (鍬形), short rear plume, full beard — fierce vanguard generals
//   crest a tall plume ridge front to back over a gilt comb, cheek guards — cavalry commanders
//   cap   no helmet: a black official's cap with long side flaps (襆頭) — strategists, admirals
const RED = 0xc02a1c;

// base soldier (= 魏軍, today's look). Keys: lamellar armor / hi (lit row) / lace (lacing line) / plate (chest plates) /
// rivet · cloth (sleeves, skirt flaps) · pants · wrap / wrapD (leg wraps) · boot · skin / skinD / eye / brow · helm /
// helmHi · band (headband) · belt / buckle · bracer · tassel (helmet top) · crest (captain's horsehair crest) · weapon
// (spear / glaive / standard tassels) · shield [face, face dark, far-LOD face]
export const GRUNT = {
  armor: 0x3e3430, hi: 0x6a5a50, lace: 0x1d1513, plate: 0x564842, rivet: 0xa07e4c,
  cloth: 0x5e3026, pants: 0x3a302b, wrap: 0x9a8566, wrapD: 0x5c4c3c, boot: 0x2a1d16,
  skin: 0xd6a07a, skinD: 0xb07e5e, eye: 0x1a1210, brow: 0x2b1b14,
  helm: 0x4a4341, helmHi: 0x8a7d74, band: 0xd0321f, belt: 0x4d3322, buckle: 0xb89040, bracer: 0x3b2a20,
  tassel: RED, crest: RED, weapon: RED, shield: [0x7a2418, 0x5e1a12, 0x6a1f15],
};
// base officer (魏 officer: blue lacquer, gold trim, red cape and plume). Extra keys: cape [fold, face], plume, helmet
export const OFFICER = {
  ...GRUNT, armor: 0x2b3350, hi: 0x6a7aa0, lace: 0x141a2c, plate: 0x3e4a70, rivet: 0xe0b450, cloth: 0x4a1a2a,
  pants: 0x23263a, wrap: 0x3a3f5a, wrapD: 0x23263a, helm: 0x2a3150, helmHi: 0xe0b450, belt: 0x6a4a20, buckle: 0xf0c860,
  cape: [0x7a1e14, 0xa82c1e], plume: RED, helmet: 'wing',
};
/** Full palettes of an army: { grunt, officer }. */
export const palette = (a) => ({ grunt: { ...GRUNT, ...a.grunt }, officer: { ...OFFICER, ...a.officer } });

export const ARMIES = {
  // 魏軍 (定軍山, 219): brown-black lamellar, red headbands / tassels / shields, blue-lacquered officers — the base look
  wei: {
    name: { zh: '魏軍', en: 'Wei' }, glyph: '魏', flag: '#b8301e', ui: '#e0412c', glow: [0.32, 0, 0, 0],
    grunt: {}, officer: {},
    officers: [{ zh: '夏侯恩', en: 'XIAHOU EN' }, { zh: '晏明', en: 'YAN MING' }, { zh: '淳于導', en: 'CHUNYU DAO' }, { zh: '張郃', en: 'ZHANG HE' }],
  },
  // 曹軍 (長坂坡 / 赤壁, 208): dark iron-blue lamellar with steel rivets, indigo coats, cobalt headbands, azure tassels
  // and navy shields — reads apart from the red 魏軍 and the green allies, and the blue accents glow against the fires
  // of the 赤壁 night. Officers: indigo lacquer, silver helmet trim, royal-blue cape, white plume.
  cao: {
    name: { zh: '曹軍', en: 'Cao Army' }, glyph: '曹', flag: '#22418a', ink: '#f2e6c8', ui: '#5a9cff', glow: [0, 0, 0.36, 0],
    grunt: {
      armor: 0x2a3140, hi: 0x66768c, lace: 0x10141c, plate: 0x394356, rivet: 0xa4acb8, cloth: 0x1f2c5a, pants: 0x252b38,
      wrap: 0x7c808c, wrapD: 0x4a4e58, boot: 0x1c1c22, helm: 0x2d3444, helmHi: 0x8a96a8, band: 0x2a64dc, belt: 0x2a2630,
      buckle: 0xb8a060, bracer: 0x222a38, tassel: 0x3c7cf0, crest: 0x2a64dc, weapon: 0x2a5ac8, shield: [0x22407e, 0x162a52, 0x1e3668],
    },
    officer: {
      armor: 0x1c2440, hi: 0x5e74b0, lace: 0x0c1022, plate: 0x2c3a68, rivet: 0xe0b450, cloth: 0x1a2456, pants: 0x1c2032,
      wrap: 0x303a5a, wrapD: 0x1c2032, helm: 0x1c2442, helmHi: 0xdfe4ec, band: 0x2a64dc, belt: 0x5a4420, buckle: 0xf0c860,
      cape: [0x121a44, 0x22388c], plume: 0xe8eef8,
    },
    officers: [
      { zh: '曹洪', en: 'CAO HONG' },
      { zh: '許褚', en: 'XU CHU', look: { helm: 'horn', armor: 0x34343c, trim: 0xb08a50, cape: 0x3a2e24, plume: 0x2a64dc } },
      { zh: '張遼', en: 'ZHANG LIAO', look: { helm: 'crest', armor: 0x20263a, trim: 0xe0b450, cape: 0x2a3a7a, plume: 0xf0f4fa } },
      { zh: '蔡瑁', en: 'CAI MAO', look: { helm: 'cap', armor: 0x243048, trim: 0xc0c8d4, cape: 0x1a2a50, plume: 0x3c7cf0 } },
    ],
  },
  // 董卓軍 (虎牢關, 190): black lacquer lamellar with a violet sheen and bronze rivets, deep purple coats, vivid purple
  // headbands / tassels / crests, purple-and-black pinwheel shields; 董 in gold on a purple standard. Officers: jet
  // black lacquer with violet-lit rows and sleeves, gold trim, purple cape and plume.
  dong: {
    name: { zh: '董卓軍', en: "Dong Zhuo's Army" }, glyph: '董', flag: '#4a2168', ink: '#f0d58a', ui: '#b87ff0', glow: [0, 0, 0, 0.36],
    grunt: {
      armor: 0x221e26, hi: 0x4e4458, lace: 0x0d0b10, plate: 0x302a38, rivet: 0xb08a48, cloth: 0x3e1a52, pants: 0x241e2a,
      wrap: 0x6a5e6c, wrapD: 0x3a3240, boot: 0x1a1418, helm: 0x28242e, helmHi: 0x9a7c48, band: 0x7a2aa8, belt: 0x2c1e24,
      buckle: 0xc09a48, bracer: 0x261e2c, tassel: 0x9a40d0, crest: 0x8030b0, weapon: 0x6a2490, shield: [0x4a1e62, 0x1c1422, 0x3a1a4e],
    },
    officer: {
      armor: 0x16121a, hi: 0x66508a, lace: 0x08060a, plate: 0x262030, rivet: 0xe0b450, cloth: 0x5a2080, pants: 0x1c1622,
      wrap: 0x3a2e46, wrapD: 0x1c1622, helm: 0x18141c, helmHi: 0xd8b050, band: 0x7a2aa8, belt: 0x5a3a1c, buckle: 0xf0c860,
      cape: [0x2a0e3c, 0x55207a], plume: 0xa040e0,
    },
    officers: [
      { zh: '華雄', en: 'HUA XIONG', look: { helm: 'horn', armor: 0x2a1a1e, trim: 0xe0b450, cape: 0x6e1830, plume: 0x9a2ad0 } },
      { zh: '胡軫', en: 'HU ZHEN' },
      { zh: '李傕', en: 'LI JUE', look: { helm: 'crest', armor: 0x2e2238, trim: 0xb88a48, cape: 0x3a1a50, plume: 0xc060f0 } },
      { zh: '李儒', en: 'LI RU', look: { helm: 'cap', armor: 0x1e1a24, trim: 0xd0b060, cape: 0x2a1a3a, plume: 0x6a2a90 } },
    ],
  },
  // 蜀軍 (定軍山, 219): green-lacquered lamellar, green coats and headbands, gold tassels
  shu: {
    name: { zh: '蜀軍', en: 'Shu' }, glyph: '蜀', flag: '#2f7a36', ui: '#6ee06e', glow: [0, 0.1, 0, 0],
    grunt: {
      armor: 0x2e3a30, hi: 0x5c7a58, lace: 0x121a14, plate: 0x3e5242, rivet: 0xc0a050, cloth: 0x2a6a30, pants: 0x2e3a2c,
      helm: 0x3a463c, helmHi: 0x8a9a80, band: 0x2b7a36, tassel: 0xd8b040, bracer: 0x2c3a28,
    },
    officer: {
      armor: 0x24402c, hi: 0x6a9468, lace: 0x0e1a10, plate: 0x365a3e, cloth: 0x1f5a2a, pants: 0x22301f, wrap: 0x3a4a36,
      wrapD: 0x22301f, helm: 0x22402a, band: 0x2b7a36, cape: [0x1a4a22, 0x2a7a36], plume: 0xd8b040,
    },
    officers: [{ zh: '關平', en: 'GUAN PING' }, { zh: '馬岱', en: 'MA DAI' }, { zh: '廖化', en: 'LIAO HUA' }, { zh: '王平', en: 'WANG PING' }],
  },
  // 劉備軍 (190-208, before Shu): the volunteer army grown up — oiled brown leather lamellar with bronze rivets, jade-green
  // coats and headbands, ivory tassels; 劉 on a deeper, bluer green than 蜀. Officers: dark green lacquer, gold, white plume.
  liu: {
    name: { zh: '劉備軍', en: "Liu Bei's Army" }, glyph: '劉', flag: '#2a6a4a', ui: '#78e0a0', glow: [0, 0.1, 0, 0],
    grunt: {
      armor: 0x3a3426, hi: 0x6a6048, lace: 0x16130c, plate: 0x4a4230, rivet: 0xb09058, cloth: 0x2c6e3e, pants: 0x34382a,
      helm: 0x3c3a2e, helmHi: 0x908a70, band: 0x38905a, tassel: 0xe8e0c8, bracer: 0x33301f,
    },
    officer: {
      armor: 0x2c3a2a, hi: 0x6a8a60, lace: 0x101a10, plate: 0x3e5238, cloth: 0x2a5a34, pants: 0x2a3024, wrap: 0x5a5a44,
      wrapD: 0x34342a, helm: 0x2a3a2c, helmHi: 0xd8b050, band: 0x38905a, cape: [0x1e4a2a, 0x2e7040], plume: 0xf0ead8,
    },
    officers: [
      { zh: '陳到', en: 'CHEN DAO' },
      { zh: '周倉', en: 'ZHOU CANG', look: { helm: 'horn', armor: 0x3a3022, trim: 0xb09058, cape: 0x2e5a34 } },
      { zh: '糜芳', en: 'MI FANG' },
      { zh: '簡雍', en: 'JIAN YONG', look: { helm: 'cap', armor: 0x2c3a2a, trim: 0xd8b050, cape: 0x2a4a30 } },
    ],
  },
};

/** Free mode's pair (ids). */
export const FREE_ARMY = { foe: 'wei', ally: 'shu' };
/** { foe, ally } ids → { foe, ally } army objects (game.army). */
export const armyPair = (ids) => ({ foe: ARMIES[ids.foe], ally: ARMIES[ids.ally] });
