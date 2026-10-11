// 第三章「赤壁」 — chapter data (format: ./chapters.js header): metadata, speakers, the battle script (BEATS), the
// prologue cards over the 赤壁 ink map (PL_MAP) and the epilogue.
// History (winter 208 AD, 赤壁之戰): 曹操, master of 荊州, sails down the Yangtze and chains his fleet at 烏林; 孫權 and
// 劉備 ally; 周瑜 plans a fire attack with 黃蓋's feigned surrender, but the winter wind blows from the north-west — 諸葛亮
// raises the 七星壇 on 南屏山 and "borrows" the south-east wind (借東風); 周瑜 sends 丁奉 and 徐盛 to kill him, but he
// slips away on 趙雲's boat; 黃蓋's fire ships ram the chained fleet (火燒連環船), the fire spreads to the camps ashore,
// and 曹操 flees by 烏林 and the 華容道 (趙雲's ambush west of 烏林, 張遼 covering him). Played as either officer: `hero` =
// the chosen one, `ally` = the other one (his pixel portrait). Everyone else speaks under a seal portrait.
// Map (src/world/maps/chibi.js): anchors altar / gate / boat / tent / mouth / road; gate 'shuizhai'; set pieces 'wind'
// (the east wind), 'ignite' (黃蓋's fire boats and the burning fleet), 'forest' (烏林 catches).

export const CH = {
  id: 'chibi', num: { zh: '第三章', en: 'CHAPTER III' }, title: { zh: '赤壁', en: 'Red Cliffs' },
  seal: '火燒連環', era: { zh: '建安十三年冬', en: 'Winter, 208 AD' }, map: 'chibi',
  heroes: ['zhugeliang', 'zhaoyun'],
  ally: { zhugeliang: 'zhaoyun', zhaoyun: 'zhugeliang' },
  army: { foe: 'cao', ally: 'liu' },
  // the altar guard drawn up either side of the altar, holding rank until the hero leaves the mesa
  van: [{ x: -24, z: -158, n: 10, cols: 5, hold: true }, { x: 12, z: -166, n: 10, cols: 5, hold: true }],
  hq: [-12, 130],                                  // 曹操's command pavilion at 烏林
  rank: { kos: [600, 1200, 2000], time: [600, 780, 960] },   // tuned to the pacing note above BEATS
};

export const SPK = {
  zhouyu: { name: { zh: '周瑜', en: 'Zhou Yu' }, seal: '瑜', side: 'shu' },
  huanggai: { name: { zh: '黃蓋', en: 'Huang Gai' }, seal: '蓋', side: 'shu' },
  lusu: { name: { zh: '魯肅', en: 'Lu Su' }, seal: '肅', side: 'shu' },
  caocao: { name: { zh: '曹操', en: 'Cao Cao' }, seal: '操', side: 'wei' },
  caihe: { name: { zh: '蔡和', en: 'Cai He' }, seal: '和', side: 'wei' },
  dingfeng: { name: { zh: '丁奉', en: 'Ding Feng' }, seal: '奉', side: 'wei' },
  xusheng: { name: { zh: '徐盛', en: 'Xu Sheng' }, seal: '盛', side: 'wei' },
  zhangnan: { name: { zh: '張南', en: 'Zhang Nan' }, seal: '南', side: 'wei' },
  maojie: { name: { zh: '毛玠', en: 'Mao Jie' }, seal: '玠', side: 'wei' },
  yujin: { name: { zh: '于禁', en: 'Yu Jin' }, seal: '禁', side: 'wei' },
  caoren: { name: { zh: '曹仁', en: 'Cao Ren' }, seal: '仁', side: 'wei' },
  xuhuang: { name: { zh: '徐晃', en: 'Xu Huang' }, seal: '晃', side: 'wei' },
  zhangliao: { name: { zh: '張遼', en: 'Zhang Liao' }, seal: '遼', side: 'wei' },
  soldier: { name: { zh: '曹軍兵', en: 'Cao Soldier' }, seal: '兵', side: 'wei' },
};

// officers (crowd.spawnOfficer). 丁奉 / 徐盛 are 周瑜's men (吳 red lacquer), sent for Kongming: no KO banner, the
// script says they fall back. The admirals and 烏林's generals ≈ 2 combos more than a default officer each.
const WU = { armor: 0x4a1a14, trim: 0xd8b050, cape: 0x8a2418 };
export const OFF = {
  caihe: { name: { zh: '蔡和', en: 'CAI HE' }, hp: 600, look: { helm: 'cap', armor: 0x243048, trim: 0xc0c8d4, cape: 0x1a2a50, plume: 0x3c7cf0 } },
  dingfeng: { name: { zh: '丁奉', en: 'DING FENG' }, hp: 520, boss: true, look: { ...WU, helm: 'wing', plume: 0xe8c050 } },
  xusheng: { name: { zh: '徐盛', en: 'XU SHENG' }, hp: 520, boss: true, look: { ...WU, helm: 'crest', plume: 0xf0e0c0 } },
  zhangnan: { name: { zh: '張南', en: 'ZHANG NAN' }, hp: 700 },
  maojie: { name: { zh: '毛玠', en: 'MAO JIE' }, hp: 850, look: { helm: 'cap', armor: 0x243048, trim: 0xc0c8d4, cape: 0x1a2a50, plume: 0x3c7cf0 } },
  yujin: { name: { zh: '于禁', en: 'YU JIN' }, hp: 1000, look: { helm: 'crest', armor: 0x1e2436, trim: 0xe0b450, cape: 0x2a3a7a, plume: 0xe8eef8 } },
  caoren: { name: { zh: '曹仁', en: 'CAO REN' }, hp: 1100, look: { helm: 'horn', armor: 0x2a2a34, trim: 0xb08a50, cape: 0x3a2e44, plume: 0x2a64dc } },
  xuhuang: { name: { zh: '徐晃', en: 'XU HUANG' }, hp: 1100, look: { helm: 'crest', armor: 0x28304a, trim: 0xc0c8d4, cape: 0x1a2a50, plume: 0x3c7cf0 } },
  guard: { name: { zh: '親衛隊長', en: 'GUARD CAPTAIN' }, hp: 320 },
};

const NAG = { who: 'lusu', zh: '將軍且慢！東風未起，七星壇不可有失！', en: 'Wait, General! The wind has not risen yet — the altar must not fall!' };
const NAG_BANK = { who: 'zhouyu', zh: '莫要孤軍深入！先與黃蓋在江岸會合。', en: 'Don\'t press on alone! Join Huang Gai at the landing first.' };
const NAG_GATE = { who: 'huanggai', zh: '水寨門緊閉！先斬守門的毛玠、于禁！', en: 'The water camp gate is barred! Cut down Mao Jie and Yu Jin who hold it!' };
const NAG_WOOD = { who: 'zhouyu', zh: '烏林尚有曹仁、徐晃，不可輕進！', en: 'Cao Ren and Xu Huang still hold Wulin. Don\'t push on yet!' };
// The altar anchor lies inside its solid base. Guard its walkable south stair, within reach of a close-range sweep.
const ALTAR_GUARD = ['altar', 0, -15];

// Pacing (default difficulty): a scripted bot that attacks nonstop clears in ≈ 7.5 min with ≈ 3000 KOs (altar 2 min
// fixed by the wind's timer · the pursuers and the landing 70 s · the fire and the gate 90 s · camp and 烏林 80 s ·
// 張遼 2 min); a human reading the dialogue lands at ≈ 10-13 min. Rank thresholds: CH.rank.
export const BEATS = [
  // ---- 南屏山 七星壇: hold the altar until the third watch, when the wind turns
  {
    when: { wait: 30 },
    obj: { zh: '守護七星壇 直至東風起', en: 'Guard the Altar of the Seven Stars until the east wind rises', go: ALTAR_GUARD, timer: 120 },
    defend: { key: 'altar', at: ALTAR_GUARD, r: 6, hp: 600, name: { zh: '七星壇', en: 'Seven Stars Altar' } },
    fail: { when: { hp: ['altar', 0.001] }, zh: '七星壇失守，東風未至……', en: 'The altar has fallen — and the east wind never came.' },
    limit: { z: ['altar', 0, 13], nag: NAG },
    squads: [{ at: ['altar', 22, 2], n: 14 }, { at: ['altar', -24, -4], n: 14 }],
    morale: 0,
    say: [
      { who: 'lusu', zh: '三更將至，江上仍是西北風……孔明先生，這風當真借得來？', en: 'The third watch is near, and still the wind blows from the north-west... Master Kongming, can you truly borrow the wind?' },
      { who: 'hero', zhugeliang: ['子敬放心。今夜三更，東南風必起。', 'Rest easy, Zijing. At the third watch tonight, the south-east wind will rise.'],
        zhaoyun: ['軍師在壇上作法。有子龍在此，誰也休想近前一步！', 'The Strategist works his rite above. While Zilong stands here, no one comes one step nearer!'] },
      { who: 'ally', zhugeliang: ['軍師只管祭風，壇下交給子龍！', 'Call the wind, Strategist. Leave the foot of the altar to me!'],
        zhaoyun: ['子龍，曹操細作已知此壇。務必守住，莫讓一人登壇。', 'Zilong, Cao Cao\'s spies know of this altar. Hold it — let no one set foot on it.'] },
    ],
  },
  {
    when: [{ kos: 30 }, { wait: 20 * 60 }],
    waves: true,
    say: [{ who: 'soldier', zh: '南屏山上有座妖壇！燒了它！', en: 'There\'s a witch\'s altar on the hill! Burn it!' }],
  },
  {
    when: [{ kos: 50, wait: 10 * 60 }, { wait: 45 * 60 }],
    skip: { timer: true },
    officers: { caihe: { at: ['altar', 20, 8], engaged: true } },
    squads: [{ at: ['altar', 18, 11], n: 12, charge: true }],
    obj: { zh: '擊破細作 蔡和', en: 'Cut down the spy, Cai He', go: 'caihe', keepTimer: true },
    say: [
      { who: 'caihe', zh: '奉丞相密令，毀此妖壇！', en: 'By the Chancellor\'s secret order — tear down this witch\'s altar!' },
      { who: 'hero', zhugeliang: ['蔡和？汝之詐降，周郎早已看破。', 'Cai He? Zhou Yu saw through your false surrender long ago.'],
        zhaoyun: ['想毀壇？先過子龍這一關！', 'You want the altar? Get past me first!'] },
    ],
  },
  {
    when: { down: 'caihe' },
    skip: { timer: true },
    banner: { html: '細作 <em>蔡和</em> 討取！', en: 'The spy Cai He is cut down', dur: 150 },
    obj: { zh: '守護七星壇 直至東風起', en: 'Guard the Altar of the Seven Stars until the east wind rises', go: ALTAR_GUARD, keepTimer: true },
    heal: 0.25, morale: 0.1, hush: true,
    say: [{ who: 'lusu', zh: '好！壇前已穩。只是這風……', en: 'Well fought! The altar holds. But the wind...' }],
  },
  // the third watch: the wind turns (set 'wind'); 周瑜, afraid of such a man, sends 丁奉 and 徐盛 to kill him
  {
    when: { timer: true },
    set: 'wind', defend: null, fail: null, waves: false, heal: 0.3, morale: 0.2, hush: true,
    banner: { html: '<em>東南風</em> 起！', en: 'The south-east wind rises!', dur: 260, big: true },
    obj: { zh: '趕往江岸', en: 'Make for the riverbank', go: ['beach', 0.25, -0.7] },
    limit: { z: ['beach', 0, -0.62], nag: NAG_BANK },
    say: [
      { who: 'lusu', zh: '風……風向轉了！真是東南風！', en: 'The wind... the wind has turned! It truly blows from the south-east!' },
      { who: 'hero', zhugeliang: ['江面風勢已轉，讓黃老將軍依計發船。', 'The gusts favor our course. Send Huang Gai the signal and put the plan in motion.'],
        zhaoyun: ['軍師真乃神人也！', 'The Strategist commands heaven itself!'] },
      { who: 'zhouyu', zh: '此人有奪天地造化之法……留之必為東吳之患。丁奉、徐盛，去南屏山！', en: 'This man bends heaven and earth to his will... Leave him alive and he will ruin Wu. Ding Feng, Xu Sheng — to the altar!' },
      { who: 'ally', zhugeliang: ['軍師，周都督的兵馬往壇上來了！船已在江邊，速走！', 'Strategist, Zhou Yu\'s men are coming up the hill! My boat waits at the river — quickly!'],
        zhaoyun: ['子龍，周郎容不得亮。船在江邊，你我速走。', 'Zilong, Zhou Yu will not suffer me to live. The boat is at the river — let us go.'] },
    ],
  },
  {
    when: { wait: 6 * 60 },
    officers: { dingfeng: { at: ['altar', 17, 12], engaged: true }, xusheng: { at: ['altar', 11, 14], engaged: true } },
    obj: { zh: '擊退丁奉・徐盛', en: 'Drive off Ding Feng and Xu Sheng', go: 'dingfeng' },
    say: [
      { who: 'dingfeng', zh: '奉都督將令，取諸葛亮首級！', en: 'By the Commander\'s order — Zhuge Liang\'s head!' },
      { who: 'hero', zhugeliang: ['周郎果然來了。可惜，亮不奉陪了。', 'So Zhou Yu sends for me after all. A pity — I shan\'t be staying.'],
        zhaoyun: ['要傷軍師，先問過子龍手中這桿槍！', 'Harm the Strategist? Ask my spear first!'] },
      { who: 'xusheng', zh: '休走！', en: 'Don\'t let him get away!' },
    ],
  },
  {
    when: { down: 'dingfeng' },
    say: [{ who: 'dingfeng', zh: '好厲害……徐將軍，撤吧！', en: 'Too strong... General Xu, fall back!' }],
  },
  {
    when: { down: 'xusheng' },
    banner: { html: '<em>丁奉・徐盛</em> 退去', en: 'Ding Feng and Xu Sheng fall back', dur: 150 },
    heal: 0.2, morale: 0.1, hush: true, retire: true,
    obj: { zh: '與黃蓋會合 江岸登陸', en: 'Join Huang Gai at the riverbank landing', go: ['boat', -8, 0] },
    limit: { z: ['gate', 0, -12], nag: NAG_BANK },
    say: [
      { who: 'xusheng', zh: '諸葛亮早有準備……回報都督！', en: 'Zhuge Liang was ready for us... Report to the Commander!' },
      { who: 'ally', zhugeliang: ['軍師，黃老將軍的船隊已到江岸！', 'Strategist, old General Huang\'s boats are at the landing!'],
        zhaoyun: ['子龍，去江岸。黃公覆的火船，只等這陣風了。', 'To the riverbank, Zilong. Huang Gongfu\'s fire ships wait only for this wind.'] },
    ],
  },

  // ---- 江岸: 張南's pickets on the landing, then 黃蓋's fire ships
  {
    when: { zone: 'beach' },
    squads: [{ at: ['beach', -0.5, -0.35], n: 20 }, { at: ['beach', 0.3, -0.15], n: 20 }, { at: ['beach', -0.3, 0.3], n: 22 }, { at: ['beach', 0.4, 0.55], n: 20 }],
    officers: { zhangnan: { at: ['beach', 0.1, 0.6] } },
    waves: true,
    obj: { zh: '擊破江岸守將 張南', en: 'Defeat the riverbank commander, Zhang Nan', go: 'zhangnan' },
    say: [
      { who: 'huanggai', zh: '曹軍的哨船看見咱們了！先掃清江岸，火船才好出江！', en: 'Cao\'s picket boats have spotted us! Clear the bank so the fire ships can put out!' },
      { who: 'zhangnan', zh: '吳狗休想靠近水寨一步！', en: 'Not one step nearer the water camp, Wu dogs!' },
    ],
  },
  {
    when: { down: 'zhangnan' },
    banner: { html: '<em>江岸</em> 已奪！', en: 'The riverbank is ours', dur: 150 },
    heal: 0.3, morale: 0.15, hush: true, retire: true, waves: false,
    set: 'ignite',
    obj: { zh: '靜待火船', en: 'Watch the fire ships go in', go: ['gate', 0, -14] },
    say: [
      { who: 'zhouyu', zh: '東南風正急！黃公覆，放船！', en: 'The south-east wind is strong! Huang Gongfu — loose the ships!' },
      { who: 'huanggai', zh: '末將得令！火船齊發——撞進曹賊的連環船！', en: 'At your command! All fire ships — into Cao\'s chained fleet!' },
      { who: 'hero', zhugeliang: ['鐵索連舟，一船著火，百船皆焚。', 'Ships chained together: set one alight, and a hundred burn.'],
        zhaoyun: ['看！火船乘風而去，快如飛箭！', 'Look! The fire ships run before the wind like arrows!'] },
    ],
  },
  {
    when: { wait: 9 * 60 },
    banner: { html: '<em>火燒連環船</em>', en: 'Fire on the chained fleet!', dur: 300, big: true },
    morale: 0.25, waves: true,
    officers: { maojie: { at: ['gate', -8, -7] }, yujin: { at: ['gate', 8, -7] } },
    squads: [{ at: ['gate', -10, -13], n: 18 }, { at: ['gate', 10, -13], n: 18 }, { at: ['beach', 0.2, 0.3], n: 18, charge: true }],
    obj: { zh: '擊破毛玠・于禁 攻破水寨', en: 'Defeat Mao Jie and Yu Jin and break into the water camp', go: 'maojie' },
    limit: { z: ['gate', 0, -3], nag: NAG_GATE },
    say: [
      { who: 'soldier', zh: '船……船都燒起來了！鐵索連著，解不開啊！', en: 'The ships... the ships are burning! They\'re chained — we can\'t cut them loose!' },
      { who: 'maojie', zh: '慌什麼！守住寨門，一個也別放進來！', en: 'Hold your nerve! Hold the gate — let no one through!' },
      { who: 'yujin', zh: '于禁在此，水寨休想輕易攻破！', en: 'Yu Jin stands here. This camp will not fall easily!' },
    ],
  },
  {
    when: { down: 'maojie' },
    obj: { zh: '擊破于禁 攻破水寨', en: 'Defeat Yu Jin and break into the water camp', go: 'yujin' },
    say: [{ who: 'yujin', zh: '毛玠！……可惡，火勢已到寨前了！', en: 'Mao Jie!... Curse it, the fire is at the stockade!' }],
  },
  {
    when: { down: 'yujin' },
    gate: 'shuizhai', heal: 0.3, morale: 0.15, retire: true, hush: true,
    banner: { html: '<em>曹軍水寨</em> 攻破！', en: 'The Cao water camp is broken open!', dur: 180 },
    obj: { zh: '突破水寨 直取烏林', en: 'Cut through the water camp to Wulin', go: ['wulin', 0, -0.8] },
    limit: { z: ['wulin', 0, 0.1], nag: NAG_WOOD },
    squads: [{ at: ['shuizhai', -0.3, -0.5], n: 18 }, { at: ['shuizhai', 0.3, -0.1], n: 18 }, { at: ['shuizhai', -0.2, 0.4], n: 20 }],
    say: [
      { who: 'huanggai', zh: '哈哈哈！曹賊，老夫詐降之計，滋味如何！', en: 'Ha! Cao, you traitor — how do you like the old man\'s false surrender now?' },
      { who: 'ally', zhugeliang: ['軍師，火已燒到岸上，曹軍大亂！', 'Strategist, the fire has spread ashore — Cao\'s army is in chaos!'],
        zhaoyun: ['子龍，直取烏林！曹操必從那裡逃走。', 'Zilong, straight on to Wulin! That is where Cao Cao will run.'] },
    ],
  },

  // ---- 烏林: the woods catch (set 'forest'); 曹仁 and 徐晃 hold the land camp
  {
    when: { zone: 'wulin' },
    set: 'forest', waves: true,
    banner: { html: '風助火勢 <em>烏林</em> 延燒！', en: 'The wind drives the fire into the woods of Wulin!', dur: 200 },
    officers: { caoren: { at: ['wulin', -0.35, 0.05] }, xuhuang: { at: ['wulin', 0.4, 0.15] } },
    squads: [{ at: ['wulin', -0.4, -0.2], n: 20 }, { at: ['wulin', 0.35, -0.1], n: 20 }, { at: ['wulin', 0, 0.35], n: 22 }],
    obj: { zh: '擊破曹仁・徐晃', en: 'Defeat Cao Ren and Xu Huang', go: 'caoren' },
    say: [
      { who: 'caoren', zh: '死守烏林！丞相大營豈容敵人踏入！', en: 'Hold Wulin to the death! No enemy sets foot in the Chancellor\'s camp!' },
      { who: 'xuhuang', zh: '林子燒起來了……穩住陣腳！', en: 'The woods are burning... hold your ranks!' },
    ],
  },
  {
    when: { down: 'caoren' },
    obj: { zh: '擊破徐晃', en: 'Defeat Xu Huang', go: 'xuhuang' },
    say: [{ who: 'xuhuang', zh: '曹仁將軍！……某來也！', en: 'General Cao Ren!... I\'m coming!' }],
  },
  {
    when: { down: 'xuhuang' },
    heal: 0.3, morale: 0.15, retire: true, hush: true, waves: false,
    banner: { html: '<em>烏林</em> 大營攻破！', en: 'The camp at Wulin is taken!', dur: 170 },
    // 曹操 (npc actor: he never fights) stands before his pavilion and laughs at his enemies — then the ambush
    actors: { caocao: { kit: 'caocao', role: 'npc', at: ['tent', 0, -9], name: { zh: '曹操', en: 'CAO CAO' }, seal: '操' } },
    actor: { key: 'caocao', do: 'hold', at: ['tent', 0, -9] },
    obj: { zh: '追擊曹操', en: 'Pursue Cao Cao', go: 'caocao' },
    limit: { z: ['mouth', 0, 2], nag: NAG_WOOD },
    say: [
      { who: 'caocao', zh: '哈哈哈……人皆言周瑜、諸葛亮足智多謀，以吾觀之，到底是無能之輩。若使此處伏下一軍，吾等皆束手受縛矣！', en: 'Ha ha ha... They call Zhou Yu and Zhuge Liang masters of strategy. Fools! Had they set one ambush here, we would all be taken.' },
      { who: 'hero', zhugeliang: ['丞相笑得太早了。亮在此，恭候多時。', 'You laugh too soon, Chancellor. I have been waiting for you.'],
        zhaoyun: ['趙子龍奉軍師將令，在此等候多時了！', 'Zhao Zilong, by the Strategist\'s order — I have been waiting for you!'] },
    ],
  },
  {
    when: [{ near: [['tent', 0, -9], 18] }, { wait: 14 * 60 }],
    actors: { zhangliao: { kit: 'zhangliao', role: 'boss', at: ['mouth', 0, -4], hp: 2600, name: { zh: '張遼', en: 'ZHANG LIAO' }, seal: '遼',
      retreatAt: 0.3, intro: { zh: '威震逍遙 張文遠', en: 'Zhang Wenyuan, terror of the south' } } },
    actor: { key: 'caocao', do: 'retreat', at: ['road', 0, 0] },
    banner: { html: '<em>張遼</em> 斷後！', en: 'Zhang Liao covers the retreat!', dur: 170, big: true },
    obj: { zh: '擊退張遼', en: 'Drive back Zhang Liao', go: 'zhangliao' },
    waves: true,
    say: [
      { who: 'caocao', zh: '文遠，斷後！走華容道！', en: 'Wenyuan, hold the rear! We take the Huarong road!' },
      { who: 'zhangliao', zh: '丞相先走！此路有張遼在，誰也休想過去！', en: 'Go, my lord! While Zhang Liao holds this road, no one passes!' },
      { who: 'hero', zhugeliang: ['張文遠，忠勇可嘉。只可惜，錯投了主。', 'Zhang Wenyuan — loyal and brave. What a pity about the master you serve.'],
        zhaoyun: ['張遼，讓開！', 'Out of my way, Zhang Liao!'] },
    ],
  },
  {
    when: { below: ['zhangliao', 0.6] },
    skip: { down: 'zhangliao' },
    banner: { html: '曹軍殘部 <em>拼死</em> 來援！', en: 'Cao\'s last men throw themselves into the fight!', dur: 160 },
    morale: -0.1,
    squads: [{ at: ['mouth', -8, 10], n: 16, charge: true }, { at: ['mouth', 8, 6], n: 16, charge: true }, { at: ['mouth', 0, -16], n: 16, charge: true }],
    officers: { guard1: { at: ['mouth', -4, 8], engaged: true, like: 'guard' }, guard2: { at: ['mouth', 4, 8], engaged: true, like: 'guard' } },
    say: [
      { who: 'zhangliao', zh: '丞相走遠了嗎……再撐一刻！', en: 'Is the Chancellor clear yet?... A little longer!' },
      { who: 'ally', zhugeliang: ['軍師，援兵交給子龍，專心對付張遼！', 'Strategist, leave their reinforcements to me — you take Zhang Liao!'],
        zhaoyun: ['子龍，莫戀戰。擊退張遼，曹操自會落入雲長之手。', 'Zilong, don\'t tarry. Drive Zhang Liao off — Cao Cao runs straight into Yunchang\'s hands.'] },
    ],
  },
  {
    when: { down: 'zhangliao' },
    win: true, waves: false, morale: 1,
    banner: { html: '<em>曹操</em> 敗走！', en: 'Cao Cao is put to flight!', dur: 260, big: true },
    say: [{ who: 'hero', zhugeliang: ['八十萬大軍，一夜灰飛。天下三分，自此始矣。', 'Eight hundred thousand, gone to ash in a night. So begins the land\'s division in three.'],
      zhaoyun: ['曹操敗走華容！此戰，大勝！', 'Cao Cao flees down the Huarong road! The day is ours!'] }],
  },
];

// ---- prologue ink map of the middle Yangtze (viewBox 1600×900, north up): 江陵 upstream, the river bending past 赤壁
// (south bank) and 烏林 (north bank) to 夏口, the 雲夢 marshes, the road north-west from 烏林 through 華容
const JIANG = 'M-20 330 C120 318 220 350 320 392 S520 520 640 548 S800 600 900 580 S1080 470 1200 430 S1420 372 1620 360';
const HAN = 'M1240 120 C1260 220 1238 320 1262 402';
const marsh = (list) => list.map(([x, y, w]) => `<path d="M${x - w} ${y} q${w * 0.5} -9 ${w} 0 t${w} 0"/>`).join('');
const peaks = (list, h, w) => list.map(([x, y, k = 1]) =>
  `<path d="M${x - w * k} ${y} Q${x - w * k * 0.35} ${y - h * k * 0.55} ${x} ${y - h * k} Q${x + w * k * 0.3} ${y - h * k * 0.5} ${x + w * k} ${y}Z"/>`).join('');
export const PL_MAP = {
  art: `<g class="pl-mtns" fill="url(#pl-mtn)" filter="url(#pl-ink)">
    ${peaks([[90, 160, 1.1], [240, 140], [380, 170, 0.9], [1360, 150, 1.1], [1500, 170], [1580, 140, 0.9]], 110, 90)}
    ${peaks([[160, 900, 1.2], [360, 880], [560, 905, 1.1], [1060, 890, 0.9], [1260, 905, 1.2], [1460, 885]], 120, 100)}
  </g>
  <g class="pl-mark" data-id="chibi" fill="url(#pl-mtn)" filter="url(#pl-ink)">${peaks([[780, 660, 0.7], [840, 650, 0.9], [900, 668, 0.6]], 90, 60)}</g>
  <g class="pl-mark" data-id="yunmeng" filter="url(#pl-ink)" fill="none" stroke="#56625e" stroke-width="3" opacity=".55" stroke-linecap="round">
    ${marsh([[430, 420, 26], [520, 440, 22], [470, 470, 30], [600, 470, 24], [380, 460, 20], [560, 405, 18], [650, 440, 20]])}
  </g>
  <g class="pl-mark" data-id="jiang" filter="url(#pl-ink)" fill="none" stroke-linecap="round">
    <path d="${JIANG}" stroke="#6f7c78" stroke-width="42" opacity=".32"/><path d="${JIANG}" stroke="#46524f" stroke-width="8" opacity=".7"/>
    <path d="${HAN}" stroke="#6f7c78" stroke-width="18" opacity=".3"/><path d="${HAN}" stroke="#46524f" stroke-width="5" opacity=".6"/>
  </g>
  <g class="pl-mark" data-id="huarong" filter="url(#pl-ink)" fill="none" stroke="#3e3430" stroke-width="4" stroke-dasharray="3 11" stroke-linecap="round" opacity=".7">
    <path d="M760 520 C660 470 560 380 470 330 S300 318 214 318"/>
  </g>
  <g class="pl-labels">
    <g class="pl-mark wei" data-id="jiangling"><rect x="186" y="290" width="32" height="32" rx="3"/><text x="146" y="274">江陵</text></g>
    <g class="pl-mark wei" data-id="huarong"><rect x="456" y="300" width="26" height="26" rx="3"/><text x="440" y="284">華容</text></g>
    <g class="pl-mark wei" data-id="wulin"><text x="700" y="488">烏林</text><text class="sm" x="742" y="530">連環船</text></g>
    <g class="pl-mark" data-id="chibi"><text x="800" y="718">赤壁</text></g>
    <g class="pl-mark" data-id="xiakou"><rect x="1250" y="412" width="30" height="30" rx="3"/><text x="1234" y="480">夏口</text></g>
    <g class="pl-mark" data-id="yunmeng"><text class="sm" x="470" y="520">雲夢澤</text></g>
    <g class="pl-mark" data-id="jiang"><text class="sm river" x="1020" y="560">長 江</text></g>
  </g>`,
  arrows: [
    ['cao1', 'wei', 'M214 336 C340 376 520 470 700 500'],
    ['ally1', 'shu', 'M1250 440 C1130 490 1000 590 880 626'],
    ['fire', 'shu', 'M880 640 C900 600 870 562 800 530'],
    ['flee', 'wei', 'M740 500 C640 450 560 372 482 326'],
  ],
};

// ---- prologue cards (format: chapters.js). Card 4 branches on the hero.
export const PROLOGUE = [
  { cols: ['建安十三年冬', '曹操既得荊州', '順江東下'], en: 'Winter, 208 AD. Master of Jingzhou, Cao Cao sails east down the Yangtze from Jiangling.',
    show: ['jiang', 'jiangling', 'cao1'], focus: [470, 420, 1.12] },
  { cols: ['北軍不習水戰', '以鐵索連舟', '屯於烏林'], en: 'His northerners are no sailors: he chains his ships together with iron and moors them at Wulin.',
    show: ['wulin', 'yunmeng'], focus: [720, 480, 1.3] },
  { cols: ['孫劉結盟', '周瑜屯兵赤壁', '黃蓋請以火攻'], en: 'Sun Quan and Liu Bei join hands. Zhou Yu holds the Red Cliffs, and Huang Gai proposes an attack by fire.',
    show: ['ally1', 'chibi', 'xiakou'], focus: [980, 540, 1.15] },
  { zhugeliang: { cols: ['萬事俱備', '只欠東風', '孔明築壇祭風'], en: '"All is ready — all but the east wind." Kongming raises an altar on Nanping Hill to call it.' },
    zhaoyun: { cols: ['常山趙雲', '奉命護衛軍師', '守七星壇'], en: 'Zhao Yun of Changshan is ordered to guard the Strategist at the Altar of the Seven Stars.' },
    show: ['fire'], focus: [830, 590, 1.42] },
  { cols: ['此戰勝負', '天下三分', '決於一夜'], en: 'Win or lose, a single night will decide whether the land splits in three.',
    show: ['flee', 'huarong'], focus: [700, 460, 1.04] },
];

// ---- result screen epilogue (win), branched on the hero
export const EPILOGUE = {
  zhugeliang: {
    zh: ['東南風大作，黃蓋火船直入曹營，連環戰船盡成火海，延及岸上營寨。', '曹操自華容道敗走，關羽念舊日之恩，義釋曹操。孔明笑曰：「曹操命不該絕，留此人情教雲長做了，亦是美事。」'],
    en: ['The south-east wind roared. Huang Gai\'s fire ships drove into Cao\'s lines; the chained fleet became a sea of flame that spread to the camps ashore.',
      'Cao Cao fled by the Huarong road, where Guan Yu, remembering an old debt, let him pass. Kongming only smiled: "His time has not yet come. Let Yunchang repay his kindness — that too is well."'],
  },
  zhaoyun: {
    zh: ['趙雲伏兵烏林以西，截殺曹軍，曹操僅以身免，奔華容道而去。', '關羽於華容道義釋曹操。曹操北還，孫劉分據荊州，天下三分之勢遂成。'],
    en: ['Zhao Yun sprang his ambush west of Wulin and cut the fleeing army to pieces; Cao Cao escaped with his life alone, down the Huarong road.',
      'There Guan Yu, remembering an old debt, let him go. Cao Cao went north, Sun and Liu divided Jingzhou — and the land was set to split in three.'],
  },
};
