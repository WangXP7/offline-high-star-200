// INKWAVE i18n — a tiny string dictionary. No framework: `t(key, params)` resolves the current language
// (persisted in localStorage 'inkwave.lang', kept in sync with the `lang` setting in 'inkwave.settings'),
// falls back to English, then to the key itself so a missing entry is obvious but never crashes.
//
// Two key styles live side by side:
//   · semantic keys ('settings.title') — used where call sites were written against the dictionary
//   · English msgids ('PLAY', 'Ink the turf') — the bulk of the UI: h() in ui-util.js passes every DOM string
//     through t(), so an exact-match dictionary entry localises it with zero call-site changes. The zh
//     dictionary lives in zh.js; English needs no entries (the key IS the English text).
// Strings use `{n}`-style placeholders. Language names stay in their own language (English / 中文) so the
// picker is usable no matter which language is active.
import { ZH_PHRASES } from './zh.js';

const STORE_KEY = 'inkwave.lang';

/** Supported languages, in menu order. `label` is the native name (never translated). */
export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '中文' },
];

const EN = {
  // ---- interpolated msgids (English template → English text; zh translations in zh.js)
  '{n} more characters to go': '{n} more characters to go',
  'Connecting to room {code}…': 'Connecting to room {code}…',
  '{n} XP to next level': '{n} XP to next level',
  '+{n} XP': '+{n} XP',
  '{n} bots': '{n} bots',
  'Uses {n}% of your ink.': 'Uses {n}% of your ink.',
  '{mode} in 30 seconds': '{mode} in 30 seconds',
  '{name} · TRACKED': '{name} · TRACKED',
  '{team} WINS!': '{team} WINS!',
  '{a} squad · {b} boss': '{a} squad · {b} boss',
  '{n} damage': '{n} damage',
  '{n} weak-point hits': '{n} weak-point hits',
  '{n} crablets': '{n} crablets',
  '{n}p inked': '{n}p inked',
  'Splatted {n}×': 'Splatted {n}×',
  'Never splatted': 'Never splatted',
  'Top all-round score': 'Top all-round score',
  '{n} splat': '{n} splat',
  '{n} splats': '{n} splats',
  '{n}p · 0 splats': '{n}p · 0 splats',
  '{m}% margin': '{m}% margin',
  '{n} px of mouse travel per 360° turn': '{n} px of mouse travel per 360° turn',
  'Shake strength {n}%': 'Shake strength {n}%',
  'Overall output {n}%': 'Overall output {n}%',
  '{n} bots join {where}': '{n} bots join {where}',
  '{n} of {m}': '{n} of {m}',
  '{n} of {m} ready': '{n} of {m} ready',
  'Waiting for {names}': 'Waiting for {names}',
  'Everyone’s ready — waiting for {name}': 'Everyone’s ready — waiting for {name}',
  'up to {n}×': 'up to {n}×',
  '{n}K atlas': '{n}K atlas',
  '{n}%': '{n}%',
  '{n}:00 + OT': '{n}:00 + OT',
  '{team} SIDE': '{team} SIDE',
  'HELD BY {team}': 'HELD BY {team}',
  'Full-stick 360° turn in <b>{n} s</b>': 'Full-stick 360° turn in <b>{n} s</b>',
  '<b>{n} px</b> of mouse travel per 360° turn': '<b>{n} px</b> of mouse travel per 360° turn',
  'You’re the host — {name} takes over the room. You can come back with the code {code}.': 'You’re the host — {name} takes over the room. You can come back with the code {code}.',
  'You can rejoin any time with the code {code} while the room is open.': 'You can rejoin any time with the code {code} while the room is open.',
  'You’re the last one here — the room closes when you leave.': 'You’re the last one here — the room closes when you leave.',

  // ---- settings screen
  'common.on': 'ON',
  'common.off': 'OFF',
  'common.view': 'VIEW',
  'common.savedAuto': 'Changes save automatically',
  'common.savedPulse': 'Saved!',
  'common.reset': 'RESET TO DEFAULTS',
  'common.pressAgain': 'PRESS AGAIN TO CONFIRM',
  'common.default': 'Default',

  'settings.title': 'SETTINGS',
  'settings.sub': 'Changes apply instantly',
  'settings.adjust': 'Adjust',
  'settings.tabs': 'Tabs',
  'settings.back': 'Back',

  'settings.tab.general': 'General',
  'settings.tab.controls': 'Controls',
  'settings.tab.video': 'Video',
  'settings.tab.audio': 'Audio',
  'settings.tab.gameplay': 'Gameplay',

  'settings.tab.general.blurb': 'Language and other basics.',
  'settings.tab.controls.blurb': 'Look speed, invert, aim assist and the full control reference.',
  'settings.tab.video.blurb': 'Quality tier, field of view and screen effects.',
  'settings.tab.audio.blurb': 'Master, music and sound-effect levels.',
  'settings.tab.gameplay.blurb': 'Shake, vibration, colour-safe inks, minimap and match defaults.',

  'settings.row.lang.label': 'Language',
  'settings.row.lang.help': 'The language for menus and on-screen text. Changes right away.',
  'settings.row.sensitivity.label': 'Mouse sensitivity',
  'settings.row.sensitivity.help': 'How far the camera turns for each bit of mouse movement.',
  'settings.row.padSensitivity.label': 'Controller sensitivity',
  'settings.row.padSensitivity.help': 'Camera turn speed with the right stick.',
  'settings.row.invertY.label': 'Invert vertical look',
  'settings.row.invertY.help': 'Push up to look down, like a flight stick.',
  'settings.row.aimAssist.label': 'Aim assist (controller)',
  'settings.row.aimAssist.help': 'Gently slows and steers your aim onto nearby rivals when you play with a controller.',
  'settings.row.aimAssistMouse.label': 'Aim assist for mouse',
  'settings.row.aimAssistMouse.help': 'Also apply a lighter aim assist when aiming with a mouse. Off by default.',
  'settings.row._howto.label': 'Controls reference',
  'settings.row._howto.help': 'Every keyboard, mouse and controller binding in one place.',
  'settings.row.quality.label': 'Graphics quality',
  'settings.row.quality.help': 'Resolution scale, shadow detail, anti-aliasing and particle counts.',
  'settings.row.quality.low': 'Low',
  'settings.row.quality.medium': 'Med',
  'settings.row.quality.high': 'High',
  'settings.row.quality.ultra': 'Ultra',
  'settings.row.fov.label': 'Field of view',
  'settings.row.fov.help': 'Wider shows more of the turf around you.',
  'settings.row.shadows.label': 'Shadows',
  'settings.row.shadows.help': 'Soft sun shadows. Turn off for extra speed on older machines.',
  'settings.row.bloom.label': 'Bloom glow',
  'settings.row.bloom.help': 'A soft glow around bright ink and specials.',
  'settings.row.showFps.label': 'Show FPS counter',
  'settings.row.showFps.help': 'Displays frames per second in the corner during matches.',
  'settings.row.fpsCap.label': 'Frame rate limit',
  'settings.row.fpsCap.help': 'Max follows your display (up to 120 Hz on ProMotion Macs). A 60 cap gives steadier pacing and longer battery life.',
  'settings.row.fpsCap.max': 'Max',
  'settings.row.fullscreen.label': 'Fullscreen',
  'settings.row.fullscreen.help': 'Fill the whole display. Also ⌃⌘F or F11.',
  'settings.row.master.label': 'Master volume',
  'settings.row.master.help': 'Overall loudness of everything.',
  'settings.row.music.label': 'Music',
  'settings.row.music.help': 'Menu and battle soundtrack.',
  'settings.row.sfx.label': 'Sound effects',
  'settings.row.sfx.help': 'Weapons, splats, voices and menu sounds.',
  'settings.row.cameraShake.label': 'Camera shake',
  'settings.row.cameraShake.help': 'Screen shake from explosions, slams and hits.',
  'settings.row.rumble.label': 'Vibration',
  'settings.row.rumble.help': 'Controller rumble for hits, splats, bombs and specials. Only while you play with a controller.',
  'settings.row.colorblind.label': 'Colorblind-safe inks',
  'settings.row.colorblind.help': 'Always use high-contrast yellow vs. blue team inks.',
  'settings.row.minimap.label': 'Minimap',
  'settings.row.minimap.help': 'Show the turf minimap in the corner during matches.',
  'settings.row.difficulty.label': 'Default bot skill',
  'settings.row.difficulty.help': 'Starting difficulty for new matches.',
  'settings.row.matchLength.label': 'Default match length',
  'settings.row.matchLength.help': 'How long each Turf War lasts.',

  'settings.dur.sec': '{n} SEC',
  'settings.dur.min': '{n} MIN',

  'settings.reset.previewLabel': 'Reset',
  'settings.reset.previewHelp': 'Restore every setting to its original value.',
  'settings.reset.previewCap': 'Press twice to restore <b>every setting</b> on every tab',
};

const ZH = {
  'common.on': '开',
  'common.off': '关',
  'common.view': '查看',
  'common.savedAuto': '更改会自动保存',
  'common.savedPulse': '已保存！',
  'common.reset': '恢复默认设置',
  'common.pressAgain': '再按一次确认',
  'common.default': '默认',

  'settings.title': '设置',
  'settings.sub': '更改立即生效',
  'settings.adjust': '调整',
  'settings.tabs': '切换页签',
  'settings.back': '返回',

  'settings.tab.general': '通用',
  'settings.tab.controls': '操作',
  'settings.tab.video': '画面',
  'settings.tab.audio': '声音',
  'settings.tab.gameplay': '玩法',

  'settings.tab.general.blurb': '语言及其他基础选项。',
  'settings.tab.controls.blurb': '视角速度、反转、辅助瞄准和完整的按键说明。',
  'settings.tab.video.blurb': '画质档位、视野范围和屏幕效果。',
  'settings.tab.audio.blurb': '总音量、音乐和音效音量。',
  'settings.tab.gameplay.blurb': '镜头震动、手柄震动、色盲墨水、小地图和对局默认设置。',

  'settings.row.lang.label': '语言',
  'settings.row.lang.help': '菜单和界面文字的显示语言，切换后立即生效。',
  'settings.row.sensitivity.label': '鼠标灵敏度',
  'settings.row.sensitivity.help': '鼠标移动一定距离时镜头转动的幅度。',
  'settings.row.padSensitivity.label': '手柄灵敏度',
  'settings.row.padSensitivity.help': '右摇杆转动镜头的速度。',
  'settings.row.invertY.label': '反转垂直视角',
  'settings.row.invertY.help': '向上推摇杆向下看，类似飞行摇杆。',
  'settings.row.aimAssist.label': '辅助瞄准（手柄）',
  'settings.row.aimAssist.help': '使用手柄游玩时，轻微减速并把准星导向附近的对手。',
  'settings.row.aimAssistMouse.label': '鼠标辅助瞄准',
  'settings.row.aimAssistMouse.help': '使用鼠标瞄准时也启用较弱的辅助瞄准。默认关闭。',
  'settings.row._howto.label': '按键说明',
  'settings.row._howto.help': '一处查看全部键盘、鼠标和手柄按键。',
  'settings.row.quality.label': '画质',
  'settings.row.quality.help': '分辨率缩放、阴影精度、抗锯齿和粒子数量。',
  'settings.row.quality.low': '低',
  'settings.row.quality.medium': '中',
  'settings.row.quality.high': '高',
  'settings.row.quality.ultra': '极高',
  'settings.row.fov.label': '视野范围',
  'settings.row.fov.help': '更宽的视野能看到身边更多的场地。',
  'settings.row.shadows.label': '阴影',
  'settings.row.shadows.help': '柔和的日光阴影。旧机器上可关闭以提速。',
  'settings.row.bloom.label': '泛光辉光',
  'settings.row.bloom.help': '明亮的墨水和大招周围的柔光效果。',
  'settings.row.showFps.label': '显示帧率',
  'settings.row.showFps.help': '对局中在角落显示每秒帧数。',
  'settings.row.fpsCap.label': '帧率上限',
  'settings.row.fpsCap.help': '跟随显示器（ProMotion Mac 最高 120 Hz）。锁定 60 帧节奏更稳、更省电。',
  'settings.row.fpsCap.max': '不限',
  'settings.row.fullscreen.label': '全屏',
  'settings.row.fullscreen.help': '铺满整个屏幕。也可用 ⌃⌘F 或 F11。',
  'settings.row.master.label': '总音量',
  'settings.row.master.help': '所有声音的整体响度。',
  'settings.row.music.label': '音乐',
  'settings.row.music.help': '菜单和对局的背景音乐。',
  'settings.row.sfx.label': '音效',
  'settings.row.sfx.help': '武器、涂墨、角色语音和菜单音效。',
  'settings.row.cameraShake.label': '镜头震动',
  'settings.row.cameraShake.help': '爆炸、猛击和受击时的画面震动。',
  'settings.row.rumble.label': '手柄震动',
  'settings.row.rumble.help': '受击、涂墨、炸弹和大招的手柄震动。仅在使用手柄时生效。',
  'settings.row.colorblind.label': '色盲友好墨水',
  'settings.row.colorblind.help': '始终使用高对比度的黄蓝两队墨水。',
  'settings.row.minimap.label': '小地图',
  'settings.row.minimap.help': '对局中在角落显示涂地小地图。',
  'settings.row.difficulty.label': '默认机器人难度',
  'settings.row.difficulty.help': '新对局的初始难度。',
  'settings.row.matchLength.label': '默认对局时长',
  'settings.row.matchLength.help': '每场占地对战的时间长度。',

  'settings.dur.sec': '{n} 秒',
  'settings.dur.min': '{n} 分钟',

  'settings.reset.previewLabel': '重置',
  'settings.reset.previewHelp': '把所有设置恢复为初始值。',
  'settings.reset.previewCap': '按两次即可恢复<b>所有页签上的全部设置</b>',
};

const DICTS = { en: EN, zh: { ...ZH, ...ZH_PHRASES } };

const listeners = new Set();
let lang = 'en';

try {
  const v = localStorage.getItem(STORE_KEY);
  if (v && DICTS[v]) lang = v;
} catch { /* private mode */ }

export function getLang() { return lang; }
export const isZh = () => lang === 'zh';

/** Translate `key` in the current language (English fallback, then the key itself). `{n}` placeholders interpolate. */
export function t(key, params = null) {
  let s = DICTS[lang][key];
  if (s === undefined) s = EN[key] !== undefined ? EN[key] : key;
  if (params) for (const k in params) s = s.replaceAll(`{${k}}`, String(params[k]));
  return s;
}

/** Switch language (idempotent). Persists, updates <html lang>, notifies `onLangChange` listeners. */
export function setLang(id) {
  if (!DICTS[id] || id === lang) { if (DICTS[id]) document.documentElement.lang = id; return; }
  lang = id;
  try { localStorage.setItem(STORE_KEY, id); } catch { /* private mode */ }
  document.documentElement.lang = id;
  for (const fn of listeners) { try { fn(id); } catch (e) { console.error('[i18n]', e); } }
}

export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
