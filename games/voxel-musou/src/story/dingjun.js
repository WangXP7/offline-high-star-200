// 第四章「定軍山」 — chapter data (format: ./chapters.js header): metadata, speakers, the battle script (BEATS), the
// prologue cards over the 漢中 ink map (PL_MAP) and the epilogue.
// History (219 AD, 漢中之戰): 劉備 camps at 陽平關; 法正 counsels seizing the heights of 定軍山; 夏侯淵 holds the
// mountain, 張郃 the eastern lines; 黃忠 storms the heights and cuts down 夏侯淵 (老當益壯); 趙雲 later saves 黃忠 at
// 漢水 and holds the empty camp (空營計). Played as either officer: `hero` = the chosen one, `ally` = the other one,
// who appears in the dialogue with his pixel portrait (chars/index.js). Everyone else speaks under a seal portrait.
// Map gates (world/map.js GATES): 'pass' barricade, 'weiCamp' castle gate, 'summit' barricade — all shut at the start.
// ['gate', dx, dz] = metres from the camp gate (the map's 'gate' anchor).

export const CH = {
  id: 'dingjun', num: { zh: '第四章', en: 'CHAPTER IV' }, title: { zh: '定軍山', en: 'Mount Dingjun' },
  seal: '漢中之戰', era: { zh: '建安二十四年', en: '219 AD' }, map: 'dingjun',
  heroes: ['huangzhong', 'zhaoyun'],
  ally: { huangzhong: 'zhaoyun', zhaoyun: 'huangzhong' },
  army: { foe: 'wei', ally: 'shu' },
  // the van drawn up either side of the road inside the 本陣 gate, holding rank until the hero marches past
  van: [{ x: -5.575, z: -121.6, n: 12, cols: 4, hold: true }, { x: 5.575, z: -121.6, n: 12, cols: 4, hold: true }],
  hq: [4, 208],                                    // 夏侯淵's pavilion on the summit
  rank: { kos: [600, 1200, 2000], time: [540, 720, 900] },   // tuned to the pacing note above BEATS
};

export const SPK = {
  liubei: { name: { zh: '劉備', en: 'Liu Bei' }, seal: '劉', side: 'shu' },
  fazheng: { name: { zh: '法正', en: 'Fa Zheng' }, seal: '法', side: 'shu' },
  yuan: { name: { zh: '夏侯淵', en: 'Xiahou Yuan' }, seal: '淵', side: 'wei', char: 'xiahouyuan' },
  zhanghe: { name: { zh: '張郃', en: 'Zhang He' }, seal: '郃', side: 'wei' },
  shang: { name: { zh: '夏侯尚', en: 'Xiahou Shang' }, seal: '尚', side: 'wei' },
  duxi: { name: { zh: '杜襲', en: 'Du Xi' }, seal: '襲', side: 'wei' },
  soldier: { name: { zh: '曹軍兵', en: 'Wei Soldier' }, seal: '兵', side: 'wei' },
};

// officers (crowd.spawnOfficer). HP: a default officer has 520 (≈ 5 full combos); the boss ≈ 4.5× that, so the
// summit duel runs ~1.5-2 min with a Musou or two, like a DW8 commander.
const YUAN_HP = 2400;                            // 夏侯淵: a boss actor (src/actors, NPC kit 'xiahouyuan'), × game.diff.officerHp
export const OFF = {
  shang: { name: { zh: '夏侯尚', en: 'XIAHOU SHANG' }, hp: 650 },
  duxi: { name: { zh: '杜襲', en: 'DU XI' }, hp: 650 },
  zhanghe: { name: { zh: '張郃', en: 'ZHANG HE' }, hp: 1100 },
  guard: { name: { zh: '親衛隊長', en: 'GUARD CAPTAIN' }, hp: 320 },
};

const SUMMIT_GATE = ['summit', -0.65, -0.53];   // the 'summit' barricade across the ramp (≈ -20, 176)
const NAG = { who: 'fazheng', zh: '將軍且慢！前方尚未肅清，不可孤軍深入。', en: 'Wait, General! The way ahead isn\'t secured — don\'t go in alone.' };
const NAG_GATE = { who: 'fazheng', zh: '營門緊閉，須先擊破守將張郃！', en: 'The gate is barred. Defeat Zhang He, who guards it!' };

// Pacing (default difficulty): a scripted bot that attacks nonstop and never dodges clears in ≈ 6 min with ≈ 3200 KOs
// (ford 45 s · pass + ambush 60 s · gate duel 90 s · camp and climb 35 s · summit 2.5 min) and ~250 damage taken; a
// human reading the dialogue and steering lands at ≈ 9-13 min. Officers only come forward after the hero has fought a
// while (kos / wait), so rushing shortens a stage but never skips one. Rank thresholds: CH.rank.
export const BEATS = [
  // ---- 蜀軍本陣: briefing, then the ford
  {
    when: { wait: 30 },
    obj: { zh: '攻佔漢水渡口', en: 'Seize the Han River ford', go: ['ford', 0, 0.4] },
    squads: [{ at: ['ford', -0.5, -0.35], n: 22 }, { at: ['ford', 0.45, -0.25], n: 22 }, { at: ['ford', -0.2, 0.2], n: 24 }, { at: ['ford', 0.35, 0.45], n: 22 }],
    limit: { z: ['pass', 0, -1], nag: NAG },
    morale: 0,
    say: [
      { who: 'liubei', zh: '定軍山乃漢中門戶，此戰成敗，在此一舉！', en: 'Mount Dingjun is the gate of Hanzhong. Everything rides on this battle!' },
      { who: 'fazheng', zh: '夏侯淵勇而無謀。先取漢水渡口，再奪山道，直搗其營。', en: 'Xiahou Yuan is brave but rash. Take the ford, then the pass, then strike his camp.' },
      { who: 'hero', huangzhong: ['老夫雖年近七旬，這一身筋骨還用得上！', 'Seventy winters or not, these old bones still have a war in them!'],
        zhaoyun: ['子龍願為先鋒，一槍開路！', 'Let me lead the van. My spear will open the road!'] },
      { who: 'ally', huangzhong: ['漢升將軍，子龍在後接應，放手去戰！', 'General Hansheng, I\'ll hold the rear. Fight without fear!'],
        zhaoyun: ['子龍，老夫隨後就到，莫想獨佔頭功！', 'Go on, Zilong. But this old man won\'t let you take all the glory!'] },
    ],
  },
  {
    when: [{ zone: 'ford' }, { kos: 60 }],
    waves: true,
    say: [
      { who: 'shang', zh: '蜀軍休想渡過漢水！弓兵，放箭！', en: 'Not one Shu soldier crosses the Han! Archers, loose!' },
      { who: 'hero', huangzhong: ['區區弓箭，也敢在老夫面前賣弄？', 'Arrows? You\'d trade shots with me?'],
        zhaoyun: ['渡口守軍不多，一鼓作氣殺過去！', 'The ford is thinly held. Through them in one charge!'] },
    ],
  },
  {
    when: [{ kos: 60, wait: 15 * 60 }, { wait: 60 * 60 }],
    officers: { shang: { at: ['ford', 0, 0.55], engaged: true } },
    obj: { zh: '擊破渡口守將 夏侯尚', en: 'Defeat the ford commander, Xiahou Shang', go: 'shang' },
    say: [{ who: 'shang', zh: '吾乃夏侯尚！來將報上名來！', en: 'I am Xiahou Shang! Name yourself!' }],
  },
  {
    when: { down: 'shang' },
    banner: { html: '<em>漢水渡口</em> 攻佔！', en: 'Han River ford captured — the army\'s spirit rises', dur: 180 },
    heal: 0.35, morale: 0.12, waves: false, retire: true, hush: true,
    obj: { zh: '突破山道', en: 'Break through the mountain pass', go: ['pass', 0, 0.2] },
    limit: { z: ['pass', 0, 0.68], nag: NAG },                      // just short of the 'pass' barricade (z 59.5)
    say: [{ who: 'fazheng', zh: '渡口已下！山道狹窄，魏軍必有埋伏，務必小心。', en: 'The ford is ours! The pass is narrow. Wei will have an ambush waiting.' }],
  },

  // ---- 山道: the ambush (mid-battle twist)
  {
    when: { zone: 'pass' },
    squads: [{ at: ['pass', -0.45, -0.55], n: 18 }, { at: ['pass', 0.4, -0.3], n: 20 }],
    waves: true,
    say: [{ who: 'soldier', zh: '蜀軍殺上山道來了！快報夏侯將軍！', en: 'Shu troops in the pass! Warn General Xiahou!' }],
  },
  {
    when: [{ at: ['pass', 0, -0.1] }, { kos: 150 }],
    banner: { html: '<em>伏兵</em>！魏軍自山道兩側殺出', en: 'Ambush! Wei troops pour down both slopes', dur: 170 },
    squads: [{ at: ['pass', -0.85, -0.35], n: 16, charge: true }, { at: ['pass', 0.85, -0.2], n: 16, charge: true },
      { at: ['pass', 0, -0.65], n: 18, charge: true }, { at: ['pass', 0, 0.15], n: 20, charge: true }],
    officers: { duxi: { at: ['pass', 0.3, 0.1], engaged: true } },
    morale: -0.1,
    obj: { zh: '擊破伏兵將 杜襲', en: 'Defeat the ambush leader, Du Xi', go: 'duxi' },
    say: [
      { who: 'duxi', zh: '哈哈，中計了！這山道就是汝等葬身之地！', en: 'Ha! You walked right in. This pass will be your grave!' },
      { who: 'fazheng', zh: '是伏兵！速斬敵將杜襲，伏兵自潰！', en: 'An ambush! Cut down Du Xi and the rest will scatter!' },
    ],
  },
  {
    when: { down: 'duxi' },
    banner: { html: '<em>伏兵</em> 擊退！', en: 'The ambush is broken', dur: 150 },
    heal: 0.3, morale: 0.12, retire: true, hush: true, gate: 'pass',
    obj: { zh: '擊破張郃 開啟營門', en: 'Defeat Zhang He and open the camp gate', go: 'zhanghe' },
    officers: { zhanghe: { at: ['gate', 0, -9] } },
    squads: [{ at: ['gate', -13, -14], n: 18 }, { at: ['gate', 13, -14], n: 18 }],
    limit: { z: ['gate', 0, -3], nag: NAG_GATE },
    say: [{ who: 'ally', huangzhong: ['漢升將軍！子龍已肅清後路，營門就交給你了！', 'General Hansheng! The road behind is clear. The gate is yours!'],
      zhaoyun: ['子龍，打得好！前方便是營門，張郃那廝就守在門前！', 'Well fought, Zilong! The gate is ahead, and Zhang He stands before it!'] }],
  },

  // ---- 魏軍營寨: Zhang He at the gate
  {
    when: { at: ['gate', 0, -28] },
    skip: { down: 'zhanghe' },
    say: [
      { who: 'zhanghe', zh: '此門有我張郃在，蜀軍休想踏入半步！', en: 'While Zhang He stands here, no Shu soldier sets foot past this gate!' },
      { who: 'hero', huangzhong: ['張儁乂，老夫久聞大名，今日領教了！', 'Zhang Junyi! I\'ve long wanted to test your famous blade!'],
        zhaoyun: ['張郃，長坂一別，今日再決高下！', 'Zhang He. Not since Changban. Let us settle it!'] },
    ],
  },
  {
    when: { down: 'zhanghe' },
    gate: 'weiCamp', limit: { z: null }, heal: 0.3, morale: 0.15, retire: true, hush: true, waves: false,
    banner: { html: '<em>魏軍營寨</em> 城門開啟！', en: 'The Wei camp gate is open!', dur: 180 },
    obj: { zh: '登頂擊破夏侯淵', en: 'Take the summit and defeat Xiahou Yuan', go: ['gate', 0, 10] },   // through the gate first
    squads: [{ at: ['camp', -0.5, 0.35], n: 20 }, { at: ['camp', 0.5, 0.5], n: 20 }, { at: ['camp', -0.6, 0.62], n: 16 }],   // courtyard ×2, foot of the ramp
    say: [
      { who: 'zhanghe', zh: '……可惡，此營守不住了。全軍，撤！', en: '...Curse it, the camp is lost. All troops, fall back!' },
      { who: 'fazheng', zh: '張郃敗走，夏侯淵已成孤軍！將軍，登上山頂，一戰定乾坤！', en: 'Zhang He has fled. Xiahou Yuan stands alone! Take the summit and end this!' },
    ],
  },
  {
    when: { at: ['gate', 0, 6] },
    // 夏侯淵 takes the field before his pavilion and holds it (a boss actor: telegraphed blows, poise, the boss bar)
    actors: { yuan: { kit: 'xiahouyuan', role: 'boss', at: ['summit', 0, 0.2], hp: YUAN_HP } },
    actor: { key: 'yuan', do: 'hold' },
    squads: [{ at: ['summit', -0.55, -0.45], n: 18 }, { at: ['summit', 0.55, -0.4], n: 18 }],
    obj: { zh: '攻破山頂柵', en: 'Break through the summit barricade', go: SUMMIT_GATE },
    say: [{ who: 'soldier', zh: '擋住他！絕不能讓他靠近夏侯將軍！', en: 'Hold him! Don\'t let him near General Xiahou!' }],
  },
  {
    // the camp's defenders thinned, 40 s passed, or he is up the ramp at the barricade 8 s in: the summit barricade burns
    when: [{ kos: 45 }, { wait: 40 * 60 }, { at: ['summit', 0, -0.9], wait: 8 * 60 }],
    gate: 'summit',
    banner: { html: '<em>山頂柵</em> 攻破！', en: 'The summit barricade is down — the road to the top is open', dur: 160 },
    obj: { zh: '擊破敵總大將 夏侯淵', en: 'Defeat the enemy commander, Xiahou Yuan', go: 'yuan' },
  },

  // ---- 定軍山頂: 夏侯淵 (boss actor), the drums at half HP, the win on his fall (no retreat)
  {
    when: { at: ['summit', 0, -0.35] },           // z ≈ 182: over the barricade (the ramp below it tops out at z ≈ 177)
    skip: { down: 'yuan' },
    banner: { html: '敵總大將 <em>夏侯淵</em>', en: 'Enemy commander: Xiahou Yuan', dur: 150, big: true },
    actor: { key: 'yuan', do: 'join' },          // he leaves his post: a taunt, then at the hero
    waves: true,
    say: [
      { who: 'yuan', huangzhong: ['白髮老兒，也敢來送死？', 'A white-haired old man, come here to die?'],
        zhaoyun: ['趙子龍！長坂之恥，今日一併清算！', 'Zhao Zilong! Today I repay you for Changban!'] },
      { who: 'hero', huangzhong: ['老當益壯！夏侯淵，你的首級，老夫要定了！', 'Old, and only stronger for it! Xiahou Yuan, your head is mine!'],
        zhaoyun: ['夏侯淵，此山今日歸我大漢！', 'Xiahou Yuan, this mountain belongs to the Han today!'] },
    ],
  },
  {
    when: { below: ['yuan', 0.5] },
    skip: { down: 'yuan' },
    banner: { html: '魏軍<em>戰鼓</em>齊鳴 — 援軍殺到！', en: 'The Wei war drums thunder — reinforcements!', dur: 170 },
    morale: -0.12,
    squads: [{ at: ['summit', -0.9, 0.5], n: 16, charge: true }, { at: ['summit', 0.9, 0.4], n: 16, charge: true }, { at: ['summit', 0, 0.95], n: 16, charge: true }],
    officers: { guard1: { at: ['summit', -0.5, 0.6], engaged: true, like: 'guard' }, guard2: { at: ['summit', 0.5, 0.6], engaged: true, like: 'guard' } },
    say: [
      { who: 'yuan', zh: '擂鼓！全軍壓上，給我碾碎他！', en: 'Beat the drums! All troops, crush him!' },
      { who: 'ally', huangzhong: ['漢升將軍，援兵交給子龍，快取夏侯淵！', 'Leave the reinforcements to me. Take Xiahou Yuan!'],
        zhaoyun: ['子龍，援兵有老夫擋著，快取夏侯淵！', 'This old man will hold their reinforcements. Go, Zilong!'] },
    ],
  },
  {
    when: { down: 'yuan' },
    win: true, waves: false, morale: 1,
    banner: { html: '敵總大將 <em>夏侯淵</em> 討取！', en: 'Enemy commander Xiahou Yuan has fallen!', dur: 260, big: true },
    say: [{ who: 'hero', huangzhong: ['老將黃忠，陣斬夏侯淵！', 'Old Huang Zhong has cut down Xiahou Yuan!'],
      zhaoyun: ['夏侯淵，已被常山趙子龍討取！', 'Xiahou Yuan has fallen to Zhao Zilong of Changshan!'] }],
  },
];

// ---- prologue ink map of 漢中 (viewBox 1600×900): the ranges, 定軍山, 漢水, places and troop arrows
const peaks = (list, h, w) => list.map(([x, y, k = 1]) =>
  `<path d="M${x - w * k} ${y} Q${x - w * k * 0.35} ${y - h * k * 0.55} ${x} ${y - h * k} Q${x + w * k * 0.3} ${y - h * k * 0.5} ${x + w * k} ${y}Z"/>`).join('');
const RIVER = 'M-20 360 C180 330 300 420 460 430 S760 360 920 420 S1220 470 1380 420 S1560 400 1620 430';
export const PL_MAP = {
  art: `<g class="pl-mtns" fill="url(#pl-mtn)" filter="url(#pl-ink)">
    ${peaks([[90, 190, 1.1], [210, 170], [330, 200, 1.2], [470, 160, .9], [600, 190, 1.1], [760, 170], [900, 185, 1.2], [1060, 160], [1200, 190, 1.1], [1350, 170, .9], [1500, 195, 1.2]], 120, 90)}
    ${peaks([[120, 900, 1.2], [300, 880], [480, 905, 1.1], [820, 890, .9], [1000, 905, 1.2], [1180, 885], [1380, 900, 1.1], [1540, 890]], 130, 100)}
    ${peaks([[250, 330, .7], [340, 318, .8]], 110, 70)}
  </g>
  <g class="pl-mark" data-id="dingjun" fill="url(#pl-mtn)" filter="url(#pl-ink)">${peaks([[560, 640, .9], [640, 620, 1.35], [730, 645, .85]], 150, 80)}</g>
  <g class="pl-mark" data-id="river" filter="url(#pl-ink)" fill="none" stroke-linecap="round">
    <path d="${RIVER}" stroke="#6f7c78" stroke-width="30" opacity=".35"/><path d="${RIVER}" stroke="#46524f" stroke-width="7" opacity=".7"/>
  </g>
  <g class="pl-labels">
    <g class="pl-mark" data-id="yangping"><rect x="276" y="286" width="30" height="30" rx="3"/><text x="330" y="312">陽平關</text></g>
    <g class="pl-mark" data-id="nanzheng"><rect x="1042" y="282" width="36" height="36" rx="3"/><text x="1034" y="350">南鄭</text></g>
    <g class="pl-mark wei" data-id="dingjun"><text x="600" y="690">定軍山</text><text class="sm" x="686" y="520">夏侯淵</text></g>
    <g class="pl-mark wei" data-id="east"><text class="sm" x="880" y="650">張郃 東圍</text></g>
    <g class="pl-mark" data-id="river"><text class="sm river" x="190" y="412">漢 水</text></g>
  </g>`,
  arrows: [
    ['shu1', 'shu', 'M150 880 C185 720 250 520 292 342'],
    ['wei1', 'wei', 'M1040 330 C930 370 810 450 712 548'],
    ['wei2', 'wei', 'M1060 350 C1040 450 990 540 930 590'],
    ['shu2', 'shu', 'M318 338 C390 400 440 480 530 612'],
    ['shu3', 'shu', 'M540 652 C570 616 596 574 626 536'],
    ['shu4', 'shu', 'M668 520 C780 420 900 340 1020 318'],
  ],
};

// ---- prologue cards (format: chapters.js). Card 4 branches on the hero.
export const PROLOGUE = [
  { cols: ['建安二十四年春', '劉備親率大軍北上', '屯兵陽平關'], en: 'Spring, 219 AD. Liu Bei marches north and makes camp at Yangping Pass.',
    show: ['shu1', 'yangping'], focus: [360, 470, 1.22] },
  { cols: ['曹魏名將夏侯淵', '據守定軍山', '張郃屯兵東圍'], en: 'Wei\'s great general Xiahou Yuan holds Mount Dingjun; Zhang He guards the eastern lines.',
    show: ['wei1', 'wei2', 'nanzheng', 'dingjun', 'east'], focus: [860, 470, 1.1] },
  { cols: ['法正獻策曰', '定軍山勢高', '奪其山則漢中可定'], en: 'Fa Zheng counsels: "Take the heights of Dingjun, and Hanzhong is ours."',
    show: ['shu2', 'river'], focus: [520, 500, 1.2] },
  { huangzhong: { cols: ['老將黃忠', '請為先鋒', '誓斬夏侯淵'], en: 'The old general Huang Zhong asks to lead the van, and swears to take Xiahou Yuan\'s head.' },
    zhaoyun: { cols: ['常山趙雲', '與黃忠並進', '渡漢水而擊之'], en: 'Zhao Yun of Changshan rides beside Huang Zhong across the Han to strike.' },
    show: ['shu3'], focus: [650, 560, 1.45] },
  { cols: ['金鼓振天', '歡聲動谷', '一戰定漢中'], en: 'Drums shake the sky and war cries fill the valleys. One battle will decide Hanzhong.',
    show: ['shu4'], focus: [700, 450, 1.04] },
];

// ---- result screen epilogue (win), branched on the hero
export const EPILOGUE = {
  huangzhong: {
    zh: ['黃忠推鋒必進，金鼓振天，一戰斬夏侯淵，曹軍大潰。', '劉備遂定漢中，進位漢中王，拜黃忠為後將軍。'],
    en: ['Huang Zhong drove on without pause; to the roar of drums he cut down Xiahou Yuan, and the Wei army broke.',
      'Liu Bei took Hanzhong and was proclaimed King of Hanzhong. Huang Zhong was named General of the Rear.'],
  },
  zhaoyun: {
    zh: ['夏侯淵既斬，曹操親率大軍來爭。趙雲救黃忠於漢水，大開營門，偃旗息鼓。', '曹軍疑有伏兵而退。劉備讚曰：「子龍一身都是膽也。」'],
    en: ['With Xiahou Yuan slain, Cao Cao came himself. Zhao Yun rescued Huang Zhong at the Han, then threw open his camp gate and silenced the drums.',
      'Fearing an ambush, Wei withdrew. Liu Bei said: "Zilong is courage through and through."'],
  },
};
