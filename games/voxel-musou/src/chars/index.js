// Character registry: metadata for the title / select / HUD / story screens, plus each character's kit (what the generic
// hero, combat, musou, vfx and audio code reads from game.hero.kit instead of importing a character's modules).
//
// char = {
//   id
//   name {zh, en}, courtesy {zh, en}, seal (red HUD seal: 2 glyphs), title {zh, en} (epithet), motto (HUD intro subline)
//   weapon {zh, en}, bio {zh: [2 lines], en: [2 lines]}, stats {atk, def, speed, range} 1-5, musou {zh, en} (Musou name)
//   accent             CSS colour of the character (select screen / HUD highlights)
//   side?              {zh, en} faction on the select screen (default 蜀 Shu Han)
//   lines              voice lines the HUD / story show: intro (battle start), musouEnd (shout after the Musou) {zh, en};
//                      copy: [2 short lines] of vertical calligraphy shown while the Musou plays
//   portrait {face, pal} 20×20 pixel portrait: rows of palette keys ('.' = clear), shared by the HUD badge, dialogue and
//                      select screen (paintPortrait below)
//   kit                see below
// }
//
// kit = {
//   moves              move table (format: src/hero/moves.js header), prepared with prepMoves (src/hero/moveset.js); every
//                      kit has n1 c1 dash jatk jc (combo.js starts these from neutral); an `aim` move = aim mode (hud.js)
//   airChainMax        air-string length per jump
//   clips              clip registry sampled by heroPose (attack + locomotion + musou clips; ids = move ids / states:
//                      idle run dodge air airFall land hurt + whatever the musou sets in h.musouClip); a clip id that
//                      is a move id is an attack clip (short 5-frame blend in)
//   feet               { moveId: (u, pose) => void } baked feet applied over a borrowed clip (moves.js `anim`)
//   runPose(phase, k, out, lean), rollPose(u, out)   procedural run / dive roll poses
//   dashPlant          dash move frame where the lunge lands (footstep dust), or -1
//   model(rig) → { material, meshes }            voxel model on the shared rig (src/hero/rig.js)
//   secondary(scene, rig, material, hero?) → { update(dt), reset() }   cloth / hair chains (hero: the battle view's)
//   trail              weapon ribbon {base, baseHeavy, tip} (m along the rig's weapon, vfx.js spearWorld) or a bow limb
//                      {axis: 'y', …} (never null)
//   fx?                vfx.js palette (complete: spread vfx.js ZY_FX; musou 'dragon' | 'own', ghost, mu — vfx.js header)
//   scale?, reach?     body scale (default rig.js HERO_SCALE), weapon ground contact {tip, butt} (rig.js spearElev)
//   weight?            camera kick × (camera.js)            voice?  {pitch, fk, growl, gain} his kiai (audio/bank.js)
//   view?(model, hero, dt, rig)   per-frame render hook after IK (hero.js createHeroView)
//   createMusou(game) → musou sim (interface: src/musou/musou.js createMusou — active, t, reset, start(inp),
//                      stepHero(inp), shot(), ready(), step(), optional aimShot() (camera.js aim shot), wave(hit, moveId)
//                      (moves.js `proj` windows: src/musou/scripted.js); emits musou:* events; hits via
//                      game.combat.strike(..., 'musou'))
//   createMusouView(scene, game, camera) → { update(dt), dispose() }   render-only
// }
// Officers written as data (a model def + a moveset) get their kit from src/chars/defkit.js (its header: the def contract).
import { ZHAOYUN_KIT } from './zhaoyun/kit.js';
import { HUANGZHONG_KIT } from './huangzhong/kit.js';
import { ZHANGFEI_KIT } from './zhangfei/kit.js';
import { FACE as ZF_FACE, PAL as ZF_PAL } from './zhangfei/model.js';
import { GUANYU_KIT } from './guanyu/kit.js';
import { FACE as GY_FACE, PAL as GY_PAL } from './guanyu/model.js';
import { LIUBEI_KIT } from './liubei/kit.js';
import { FACE as LB_FACE, PAL as LB_PAL } from './liubei/model.js';
import { ZHUGELIANG_KIT } from './zhugeliang/kit.js';
import { FACE as ZG_FACE, PAL as ZG_PAL } from './zhugeliang/model.js';
import { LUBU_KIT } from './lubu/kit.js';
import { FACE as LU_FACE, PAL as LU_PAL } from './lubu/model.js';

const ZY_FACE = [
  '....................',
  '.......KKKKK........',
  '.....KKKKKKKKK......',
  '....KKKKKKKKKKKK....',
  '...KKKkkKKKKKKKKK...',
  '...KKKKKKKKKKKKKKKK.',
  '...KTTTTTTTTTTTTKKTt',
  '...KKKKKKKKKKKKKKKtT',
  '...KKKSKKKKKSKKKKKKt',
  '...KKSSSSSSSSSSKKKKK',
  '...KKEESSSSSSEEKKKK.',
  '...KKSwESSSSwESKKKK.',
  '...KKSSSSSsSSSSKKK..',
  '....KSSSSSsSSSSKKK..',
  '....KsSSSSSSSSsKK...',
  '.....sSSSMMSSSsKK...',
  '......ssSSSSssKK....',
  '...WWTtssssssTtWW...',
  '.WWWWWWTWWWWTWWWWW..',
  'WWwwWWWWTWWTWWWWwwW.',
];
// Huang Zhong: grey topknot, red headband, heavy brows, white moustache and long beard, gold lamellar collar
const HZ_FACE = [
  '....................',
  '.......GGGGG........',
  '.....GGGGGGGGG......',
  '....GGGGGGGGGGGG....',
  '...GGGggGGGGGGGGG...',
  '...GGGGGGGGGGGGGGG..',
  '...GRRRRRRRRRRRRGGRr',
  '...GGGGGGGGGGGGGGGrR',
  '...GGSSSSSSSSSSGGGGr',
  '...GGSkkSSSSkkSGGGG.',
  '...GGEESSSSSSEEGGGG.',
  '...GGSwESSSSwESGGG..',
  '...GGSSSSSsSSSSGGG..',
  '....GSSggGGggSSGG...',
  '....GSGGGMMGGGSG....',
  '.....GGGGGGGGGGG....',
  '......GgGGGGGgG.....',
  '...YYyGGGGGGGyYY....',
  '.YYYYYYyGgGyYYYYY...',
  'YYyyYYYYyGyYYYYyyY..',
];
const PAL = { K: '#1d1514', k: '#4a3834', S: '#efc3a0', s: '#c38a6c', E: '#140c0c', M: '#7e3a2e', T: '#3fb8b0', t: '#1f5f5c',
  W: '#efe8de', w: '#ffffff', G: '#dcd6cc', g: '#9a948a', R: '#b3261e', r: '#6e1712', Y: '#d9a53a', y: '#8a5a1a' };

export const CHARS = {
  liubei: {
    id: 'liubei',
    name: { zh: '劉備', en: 'Liu Bei' }, courtesy: { zh: '玄德', en: 'Xuande' }, seal: '皇叔',
    title: { zh: '仁德之主', en: 'The Benevolent Lord' }, motto: '中山靖王之後 · 桃園結義 · 仁德昭烈',
    weapon: { zh: '雙股劍', en: 'Twin Swords' },
    bio: {
      zh: ['涿郡人，中山靖王之後，雙耳垂肩，兩手過膝。', '桃園結義，與關張誓同生死；以仁德待人，百姓歸心。'],
      en: ['A man of Zhuo descended from Prince Jing of Zhongshan, his earlobes reaching his shoulders, his hands his knees.',
        'Sworn brother to Guan Yu and Zhang Fei in the peach garden, he won the people with benevolence.'],
    },
    stats: { atk: 3, def: 3, speed: 4, range: 3 }, musou: { zh: '昭烈・雙龍斬', en: 'Twin Dragons' }, accent: '#6cb24e',
    lines: {
      intro: { zh: '吾乃中山靖王之後，劉玄德！', en: 'I am Liu Xuande, descendant of Prince Jing of Zhongshan!' },
      musouEnd: { zh: '為天下蒼生，此戰必勝！', en: 'For the people of the realm — this battle is ours!' },
      copy: ['仁德所至', '萬民歸心'],
    },
    portrait: { face: LB_FACE, pal: LB_PAL },
    kit: LIUBEI_KIT,
  },
  zhaoyun: {
    id: 'zhaoyun',
    name: { zh: '趙雲', en: 'Zhao Yun' }, courtesy: { zh: '子龍', en: 'Zilong' }, seal: '常山',
    title: { zh: '常山龍膽', en: 'The Dragon of Changshan' }, motto: '常山龍膽 · 單騎無雙 · 義貫雲天',
    weapon: { zh: '龍膽槍', en: 'Dragon-Heart Spear' },
    bio: {
      zh: ['常山真定人，一杆長槍，長坂坡單騎救主。', '先主讚曰：「子龍一身都是膽也。」'],
      en: ['A spearman of Changshan who rode alone through Cao Cao\'s host at Changban.', 'Liu Bei said of him: "Zilong is courage through and through."'],
    },
    stats: { atk: 4, def: 3, speed: 5, range: 3 }, musou: { zh: '蒼龍破陣', en: 'Azure Dragon Breach' }, accent: '#3fb8b0',
    lines: {
      intro: { zh: '主公之子在此，趙雲誓死護之！', en: 'My lord\'s son is in my care. None of you shall pass!' },
      musouEnd: { zh: '吾乃常山趙子龍也！', en: 'I am Zhao Zilong of Changshan!' },
      copy: ['長槍所向', '百軍皆破'],
    },
    portrait: { face: ZY_FACE, pal: PAL },
    kit: ZHAOYUN_KIT,
  },
  huangzhong: {
    id: 'huangzhong',
    name: { zh: '黃忠', en: 'Huang Zhong' }, courtesy: { zh: '漢升', en: 'Hansheng' }, seal: '老將',
    title: { zh: '老當益壯', en: 'The Veteran Who Never Ages' }, motto: '老當益壯 · 百步穿楊 · 定軍斬將',
    weapon: { zh: '破軍弓', en: 'Army-Breaker Longbow' },
    bio: {
      zh: ['南陽人，年近七旬，開硬弓百發百中。', '定軍山一戰，陣斬夏侯淵，威震漢中。'],
      en: ['A Nanyang veteran near seventy whose great bow never misses.', 'At Mount Dingjun he cut down Xiahou Yuan and shook all Hanzhong.'],
    },
    stats: { atk: 4, def: 3, speed: 2, range: 5 }, musou: { zh: '百步穿楊', en: 'Hundred-Pace Volley' }, accent: '#d9a53a',
    lines: {
      intro: { zh: '老將黃忠在此！誰敢與我一戰？', en: 'Old Huang Zhong stands here! Who dares face me?' },
      musouEnd: { zh: '老夫寶刀未老！', en: 'This old blade has not dulled!' },
      copy: ['一矢既出', '萬軍辟易'],
    },
    portrait: { face: HZ_FACE, pal: PAL },
    kit: HUANGZHONG_KIT,
  },
  zhangfei: {
    id: 'zhangfei',
    name: { zh: '張飛', en: 'Zhang Fei' }, courtesy: { zh: '翼德', en: 'Yide' }, seal: '燕人',
    title: { zh: '萬人之敵', en: 'A Match for Ten Thousand' }, motto: '燕人張翼德 · 當陽一喝 · 萬夫莫當',
    weapon: { zh: '丈八蛇矛', en: 'Eighteen-Foot Serpent Spear' },
    bio: {
      zh: ['涿郡人，豹頭環眼，燕頷虎鬚，聲若巨雷。', '長坂橋頭橫矛一喝，曹軍百萬無人敢近。'],
      en: ['A man of Zhuo with a leopard\'s head, round glaring eyes and a tiger\'s bristling beard; his voice is thunder.',
        'Alone on the bridge at Changban he levelled his spear and roared — and Cao Cao\'s host dared not come on.'],
    },
    stats: { atk: 5, def: 4, speed: 2, range: 4 }, musou: { zh: '燕人咆哮', en: 'Roar of the Man of Yan' }, accent: '#d4552a',
    lines: {
      intro: { zh: '燕人張翼德在此！誰敢與我決一死戰？', en: 'Zhang Yide of Yan stands here! Who dares fight me to the death?' },
      musouEnd: { zh: '戰又不戰，退又不退，卻是何故！', en: 'You will not fight, you will not flee — what are you waiting for?!' },
      copy: ['一聲咆哮', '萬軍倒退'],
    },
    portrait: { face: ZF_FACE, pal: ZF_PAL },
    kit: ZHANGFEI_KIT,
  },
  guanyu: {
    id: 'guanyu', side: { zh: '蜀', en: 'Shu Han' },
    name: { zh: '關羽', en: 'Guan Yu' }, courtesy: { zh: '雲長', en: 'Yunchang' }, seal: '武聖',
    title: { zh: '美髯公', en: 'Lord of the Magnificent Beard' }, motto: '河東關雲長 · 溫酒斬將 · 義貫古今',
    weapon: { zh: '青龍偃月刀', en: 'Green Dragon Blade' },
    bio: {
      zh: ['河東解良人，面如重棗，丹鳳眼，臥蠶眉。', '溫酒斬華雄，千里走單騎，義薄雲天。'],
      en: ['Of Hedong: a face red as a ripe jujube, phoenix eyes, silkworm brows.',
        'He slew Hua Xiong before the wine went cold and rode a thousand li alone.'],
    },
    stats: { atk: 5, def: 4, speed: 3, range: 4 }, musou: { zh: '青龍偃月・天斬', en: 'Sky Cleaver' }, accent: '#3cae6e',
    lines: {
      intro: { zh: '關雲長在此！插標賣首之輩，速來受死！', en: 'Guan Yunchang is here! Come, you who wear your heads for sale!' },
      musouEnd: { zh: '忠義在心，青龍在手！', en: 'Loyalty in my heart, the Green Dragon in my hand!' },
      copy: ['青龍一揮', '千軍盡斬'],
    },
    portrait: { face: GY_FACE, pal: GY_PAL },
    kit: GUANYU_KIT,
  },
  zhugeliang: {
    id: 'zhugeliang', side: { zh: '蜀', en: 'Shu Han' },
    name: { zh: '諸葛亮', en: 'Zhuge Liang' }, courtesy: { zh: '孔明', en: 'Kongming' }, seal: '臥龍',
    title: { zh: '臥龍', en: 'The Sleeping Dragon' }, motto: '羽扇綸巾 · 運籌帷幄 · 決勝千里',
    weapon: { zh: '白羽扇', en: 'White Feather Fan' },
    bio: {
      zh: ['琅琊陽都人，躬耕南陽，自比管仲、樂毅。', '先主三顧茅廬，隆中一對，天下三分。'],
      en: ['A scholar of Langya who farmed at Nanyang and likened himself to the great ministers of old.',
        'Liu Bei called on his cottage three times; in one talk at Longzhong he laid out the realm divided in three.'],
    },
    stats: { atk: 3, def: 2, speed: 3, range: 5 }, musou: { zh: '東風・八陣', en: 'East Wind · Eight Formations' }, accent: '#9c8cf0',
    lines: {
      intro: { zh: '東風已起，破敵正在今日。', en: 'The east wind has risen. Today the enemy breaks.' },
      musouEnd: { zh: '運籌帷幄之中，決勝千里之外。', en: 'Plans laid in the tent decide battles a thousand li away.' },
      copy: ['羽扇一揮', '八陣圖成'],
    },
    portrait: { face: ZG_FACE, pal: ZG_PAL },
    kit: ZHUGELIANG_KIT,
  },
  lubu: {
    id: 'lubu', side: { zh: '群', en: 'Warlords' },
    name: { zh: '呂布', en: 'Lü Bu' }, courtesy: { zh: '奉先', en: 'Fengxian' }, seal: '飛將',
    title: { zh: '飛將', en: 'The Flying General' }, motto: '人中呂布 · 馬中赤兔 · 天下無雙',
    weapon: { zh: '方天畫戟', en: 'Sky-Piercer Halberd' },
    bio: {
      zh: ['五原九原人，弓馬嫻熟，膂力過人，號為飛將。', '虎牢關前一戟當關，劉關張三英合戰，方纔戰他得住。'],
      en: ['A rider of Jiuyuan on the northern frontier, peerless with bow and horse — they called him the Flying General.',
        'Before Hulao Gate he held the pass alone with his halberd; it took Liu, Guan and Zhang together to hold him off.'],
    },
    stats: { atk: 5, def: 4, speed: 4, range: 4 }, musou: { zh: '天下無雙・神鬼亂舞', en: 'Peerless: Dance of Gods and Demons' }, accent: '#d8283c',
    lines: {
      intro: { zh: '呂奉先在此！爾等鼠輩，誰先來送死？', en: 'Lü Fengxian stands here! Which of you rats dies first?' },
      musouEnd: { zh: '天下無雙者，唯我呂布一人！', en: 'Peerless under heaven — there is only Lü Bu!' },
      copy: ['一戟橫掃', '天下無雙'],
    },
    portrait: { face: LU_FACE, pal: LU_PAL },
    kit: LUBU_KIT,
  },
};
export const CHAR_ORDER = ['liubei', 'guanyu', 'zhangfei', 'zhaoyun', 'zhugeliang', 'huangzhong', 'lubu'].filter((id) => CHARS[id]);

/** Paint a char's 20×20 portrait into a canvas (width/height 20; scale it with CSS, image-rendering: pixelated). */
export function paintPortrait(cv, char) {
  const g = cv.getContext('2d'), { face, pal } = char.portrait;
  g.clearRect(0, 0, cv.width, cv.height);
  face.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); } }));
}
