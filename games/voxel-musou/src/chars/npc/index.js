// NPC key characters: story figures who take the field only as hero-model actors (game.actors, src/actors/actors.js) —
// never on the select screen. NPCS id → { id, name {zh, en}, courtesy {zh, en}, seal, portrait (20×20), kit } — the
// actor-facing half of a CHARS entry (src/chars/index.js), so game.actors.spawn(key, { kit: id }) resolves either one. The
// kits come from ./kit.js (npcKit: a model def + a weapon-class clip set with its boss attack table).
import { npcKit } from './kit.js';
import * as SWORD from './sword.js';
import * as POLEARM from './polearm.js';
import { DEF as CAOCAO } from './caocao.js';
import { DEF as ZHANGLIAO } from './zhangliao.js';
import { DEF as XIAHOUYUAN } from './xiahouyuan.js';

const PORTRAITS = {
  caocao: {
    face: [
      '........YYYY........',
      '.......YyyYY........',
      '.......KYYKK........',
      '......KKKKKKKK......',
      '.....KKKKKKKKKK.....',
      '....YYYYYRYYYYYY....',
      '...KKSSSSSSSSSSKK...',
      '...KSSSSSSSSSSSSK...',
      '...SSKKKSSSSKKKSS...',
      '...SSWwESSSSEwWSS...',
      '...SSSSSSssSSSSSS...',
      '....SSSSSssSSSSS....',
      '....sSSSSSSSSSSs....',
      '.....sKKKSSKKKs.....',
      '.....sSSKMMKSSs.....',
      '......sSKKKKss......',
      '....RRKKSKKSKKRR....',
      '..RRRRKYKKKKYKRRRR..',
      '.RRrRRRKYYYYKRRRrRR.',
      'RRrRRRRKKYYKKRRRRrRR',
    ],
    pal: { Y: '#ecc866', y: '#7a5a22', K: '#18151b', S: '#e2b692', s: '#ba8a6a', W: '#eae2d6', w: '#ba8a6a', E: '#0c0a0a',
      M: '#9a5646', R: '#9a2428', r: '#480c10' },
  },
  zhangliao: {
    face: [
      '........WW..........',
      '........WwW.........',
      '........YWWw........',
      '.......IIYIII.......',
      '.....IIiiYiiIII.....',
      '....IIiiIYIiiIII....',
      '...IIYYYYYYYYYIII...',
      '...iISSSSSSSSSSIi...',
      '...iISKKSSSSKKSIi...',
      '...iISWESSSSEWSIi...',
      '...iISSSSssSSSSIi...',
      '...iIsSSSssSSSsIi...',
      '....IsSSSSSSSSsI....',
      '....IsKKSSSSKKsI....',
      '.....sSKMMMMKSs.....',
      '.....sSKKKKKKSs.....',
      '....iiIKKKKKKIii....',
      '..IIIIiYKKKKYiIIII..',
      '.IIiIIIiYYYYiIIIiII.',
      'IIiIIIIiiYYiiIIIIiII',
    ],
    pal: { W: '#e8ecf2', w: '#5a6680', Y: '#c8a258', I: '#1e2840', i: '#56647e', K: '#121014', S: '#d6a47e', s: '#b07a58',
      E: '#0c0a0a', M: '#8a4a3e' },
  },
  xiahouyuan: {
    face: [
      '........RRR.........',
      '........RrRR........',
      '.......YRRRRR.......',
      '......YIYYIIYY......',
      '.....YIIYIIYIIY.....',
      '....IIYYYIYYYIII....',
      '...iiYYYYYYYYYii....',
      '...IYSSSSSSSSSYI....',
      '...IYSKKSSSSKKSYI...',
      '...IYSWESSSSEWSYI...',
      '...IYSSSSssSSSSYI...',
      '...IYsSSSssSSSsYI...',
      '....YsSSSSSSSSsY....',
      '....YsKKKSSKKKsY....',
      '.....KKgKMMKgKK.....',
      '.....KKKKggKKKK.....',
      '....YYKKgKKgKKYY....',
      '..IIiYYKKKKKKYYiII..',
      '.IIiIIYYgKKgYYIIiII.',
      'IIiIIIIYYRRYYIIIIiII',
    ],
    pal: { R: '#d8462c', r: '#6a1a10', Y: '#e0b85e', I: '#3e414c', i: '#62667a', K: '#1a1412', g: '#7a726a', S: '#c68e6c',
      s: '#96644a', W: '#e8dccc', E: '#0a0808', M: '#6a3428' },
  },
};

export const NPCS = {
  caocao: { id: 'caocao', name: { zh: '曹操', en: 'Cao Cao' }, courtesy: { zh: '孟德', en: 'Mengde' }, seal: '奸雄', portrait: PORTRAITS.caocao, kit: npcKit(CAOCAO, SWORD) },
  zhangliao: { id: 'zhangliao', name: { zh: '張遼', en: 'Zhang Liao' }, courtesy: { zh: '文遠', en: 'Wenyuan' }, seal: '雁門', portrait: PORTRAITS.zhangliao, kit: npcKit(ZHANGLIAO, POLEARM) },
  xiahouyuan: { id: 'xiahouyuan', name: { zh: '夏侯淵', en: 'Xiahou Yuan' }, courtesy: { zh: '妙才', en: 'Miaocai' }, seal: '虎步', portrait: PORTRAITS.xiahouyuan, kit: npcKit(XIAHOUYUAN, POLEARM) },
};
