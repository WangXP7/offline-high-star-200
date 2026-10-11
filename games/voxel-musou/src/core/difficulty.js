// Difficulty: the four tiers and the player's pick (kept per browser). Picked on the title's difficulty panel after the
// chapter / trial / battlefield; main.js startBattle copies the pick into game.diff (fixed for that battle). 修羅 is
// locked until the records open it (core/progress.js UNLOCKS 'chaos'; a tier's id is its record / unlock key).
// Design: grunts stay one-sweep fodder on every tier; the tiers turn pressure, officer toughness and the cost of a
// mistake. Sim readers: crowd.js (hp, windup, strikers, gap, grace), combat.js (dmg, armor), crowd/view.js (windup),
// story/index.js (heal, rank).
//   gruntHp / officerHp  Wei hp multipliers (story officers too; Shu allies untouched)
//   dmg        enemy blows on the hero (grunt 10 / officer 22 at ×1)
//   windup     sim frames from wind-up start to the blow (the telegraph)
//   strikers   Wei soldiers winding up at once        gap / grace  strike-start gap / feint window after a blow lands
//   armor      officers shrug off non-heavy hits (no flinch: they keep swinging through a combo)
//   heal       stage-clear heal multiplier (story `heal` beats)
//   rankBonus / rankMax   story rank: extra points / best rank reachable
//   bars       title card pips 1-5: [敵勢 pressure, 敵將 officers, 傷害 damage]
import { locked } from './progress.js';

export const DIFFS = [
  { id: 'easy', zh: '初級', en: 'Easy', line: ['新兵亦可橫掃千軍', 'Even a recruit can sweep a thousand.'], bars: [1, 1, 1],
    gruntHp: 1, officerHp: 0.6, dmg: 0.5, windup: 50, strikers: 1, gap: 1.4, grace: 1.6, armor: false, heal: 1.5, rankBonus: 0, rankMax: 'A' },
  { id: 'normal', zh: '普通', en: 'Normal', line: ['沙場本色', 'The battlefield as it is.'], bars: [2, 2, 2],
    gruntHp: 1, officerHp: 1, dmg: 1, windup: 40, strikers: 2, gap: 1, grace: 1, armor: false, heal: 1, rankBonus: 0, rankMax: 'S' },
  { id: 'hard', zh: '上級', en: 'Hard', line: ['敵將兇猛，須善用閃避', 'Fierce officers. Read the wind-up and dodge.'], bars: [4, 3, 3],
    gruntHp: 1, officerHp: 1.4, dmg: 1.5, windup: 35, strikers: 2, gap: 0.8, grace: 0.6, armor: false, heal: 0.7, rankBonus: 1, rankMax: 'S' },
  { id: 'chaos', zh: '修羅', en: 'Chaos', line: ['一騎當千，九死一生', 'One against a thousand. Few come back.'], bars: [5, 5, 5],
    gruntHp: 1.3, officerHp: 2, dmg: 2.2, windup: 30, strikers: 3, gap: 0.6, grace: 0.3, armor: true, heal: 0.4, rankBonus: 2, rankMax: 'S' },
];
const KEY = 'voxel-musou.diff';
const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

/** A tier is open unless the records still lock it (修羅: progress.js). */
export const unlocked = (d) => !locked(d.id);
let cur = DIFFS.find((d) => d.id === get(KEY) && unlocked(d)) || DIFFS[1];

export const difficulty = () => cur;
export function setDifficulty(d) { cur = d; try { localStorage.setItem(KEY, d.id); } catch { /* no storage */ } }
