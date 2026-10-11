// 張飛's moveset (def-kit moveset: src/chars/defkit.js header) — the 丈八蛇矛 swung like a club by a man who would rather
// hit you with his fist: big flat swings, a haymaker, chops from over the shoulder, the butt of the spear driven into the
// earth. Data like src/hero/moves.js (+ roar / proj windows); clips frame-keyed with hero/anims/author.js.
//   N1 flat swing right → left · N2 rising backhand left → right · N3 two-handed driving thrust · N4 left haymaker, the
//   spear trailed in the right hand · N5 chop from over the right shoulder · N6 low leg sweep, a hop, the blade stabbed
//   into the ground
//   C1 (neutral) 裂地: wound back over the head, slammed flat — the crack runs 7 m ahead · C2 (N1→) scoop launcher ·
//   C3 (N2→) three chops walking forward, left, right, the last one two-handed · C4 (N3→) one full turn at arm's length
//   from the butt · C5 (N4→) the butt stamped down left, right, then the shaft slammed flat across the front
//   C6 (N5→) 當陽一喝: swung up, planted upright, a breath — the roar (rings of shock, proj 'roar')
//   dash: head-down bull rush, spear trailed low, into a rising swing · air: chop ↓, backhand, a whirl ·
//   jump charge: the spear twirled flat over the head through the hang, then dropped point-first into the ground
// Musou 燕人咆哮 (musou/scripted.js): the roar · bull rush (CONTACT) · three chops · a turn · FINISHER: the shaft slammed
// flat, a second roar ring.
import { spearAbout, sampleClip, POSE_SIZE } from '../../hero/rig.js';
import { locoClips } from '../loco.js';

const ONCE = 99;
export const airChainMax = 6;

export function moves() {
  return {
    n1: { frames: 28, next: 'n2', charge: 'c2', cancel: 18, branch: 9, dodgeCancel: 9, steer: 6, lunge: [[3, 10, 0.45]],
      hits: [{ f: [8, 11], sweep: 1, shape: 'arc', range: 3.3, ang: 150, dir: 15, dmg: 14, kb: 'flinch', force: 4, hitstop: 3 }] },
    n2: { frames: 30, next: 'n3', charge: 'c3', cancel: 20, branch: 11, dodgeCancel: 11, steer: 5, lunge: [[2, 11, 0.6]],
      hits: [{ f: [9, 12], sweep: -1, shape: 'arc', range: 3.3, ang: 160, dir: -15, dmg: 15, kb: 'push', force: 5, lift: 2, hitstop: 3 }] },
    n3: { frames: 36, next: 'n4', charge: 'c4', cancel: 25, branch: 16, dodgeCancel: 16, steer: 4, lunge: [[4, 12, 1.3]],
      hits: [{ f: [11, 13], every: ONCE, shape: 'line', len: 4.0, width: 1.4, dmg: 17, kb: 'blow', force: 9, lift: 2, hitstop: 4 }] },
    n4: { frames: 40, next: 'n5', charge: 'c5', cancel: 29, branch: 19, dodgeCancel: 19, steer: 7, lunge: [[5, 14, 1.0]], armor: true,
      hits: [{ f: [11, 14], every: ONCE, shape: 'arc', range: 1.6, ang: 60, dir: 30, dmg: 18, kb: 'blow', force: 12, lift: 3, hitstop: 6 }] },
    n5: { frames: 44, next: 'n6', charge: 'c6', cancel: 32, branch: 23, dodgeCancel: 23, steer: 4, lunge: [[4, 16, 0.8]], armor: true,
      hits: [{ f: [16, 18], every: ONCE, shape: 'arc', range: 3.5, ang: 70, dmg: 22, kb: 'push', force: 8, hitstop: 5 }] },
    n6: { frames: 62, next: 'n1', charge: 'c1', cancel: 52, dodgeCancel: 44, steer: 5, lunge: [[8, 40, 0.9]], armor: true,
      hits: [{ f: [12, 16], sweep: 1, shape: 'arc', range: 3.6, ang: 220, dmg: 12, kb: 'launch', force: 2, lift: 4, hitstop: 2 },
        { f: [40, 42], every: ONCE, shape: 'circle', range: 4.8, dmg: 30, kb: 'blow', force: 13, lift: 7, hitstop: 8, heavy: true, rocks: 12 }] },

    c1: { frames: 76, cancel: 66, dodgeCancel: 48, steer: 12, lunge: [[18, 30, 0.9]], armor: true,
      hits: [{ f: [30, 33], every: ONCE, shape: 'line', len: 7.5, width: 2.2, dmg: 26, kb: 'launch', force: 3, lift: 10, hitstop: 7, heavy: true }] },
    c2: { frames: 56, cancel: 46, dodgeCancel: 28, steer: 10, lunge: [[8, 18, 1.1]], armor: true,
      hits: [{ f: [16, 19], every: ONCE, shape: 'arc', range: 3.4, ang: 120, dmg: 19, kb: 'launch', force: 2, lift: 12, hitstop: 6, heavy: true }] },
    c3: { frames: 96, cancel: 86, dodgeCancel: 72, steer: 9, lunge: [[10, 20, 0.9], [30, 40, 0.9], [52, 64, 1.3]], armor: true,
      hits: [{ f: [18, 20], every: ONCE, shape: 'arc', range: 3.4, ang: 80, dmg: 12, kb: 'flinch', force: 3, hitstop: 3 },
        { f: [38, 40], every: ONCE, shape: 'arc', range: 3.4, ang: 80, dmg: 14, kb: 'flinch', force: 3, hitstop: 3 },
        { f: [62, 65], every: ONCE, shape: 'arc', range: 4.0, ang: 100, dmg: 26, kb: 'blow', force: 13, lift: 6, hitstop: 7, heavy: true }] },
    c4: { frames: 74, cancel: 64, dodgeCancel: 46, steer: 12, lunge: [[18, 34, 0.8]], armor: true,
      hits: [{ f: [24, 34], sweep: 1, dir: 92, shape: 'circle', range: 3.6, dmg: 24, kb: 'blow', force: 13, lift: 5, hitstop: 6, heavy: true }] },
    c5: { frames: 98, cancel: 88, dodgeCancel: 64, steer: 9, lunge: [[10, 20, 0.4], [30, 40, 0.4], [56, 66, 0.6]], armor: true,
      hits: [{ f: [20, 21], every: ONCE, shape: 'circle', range: 3.4, dmg: 10, kb: 'push', force: 7, hitstop: 3, heavy: true, rocks: 6 },
        { f: [40, 41], every: ONCE, shape: 'circle', range: 3.8, dmg: 12, kb: 'push', force: 8, hitstop: 3, heavy: true, rocks: 8 },
        { f: [66, 68], every: ONCE, shape: 'circle', range: 5.6, dmg: 28, kb: 'launch', force: 4, lift: 10, hitstop: 8, heavy: true, yMax: 4.5, rocks: 16 }] },
    c6: { frames: 104, cancel: 94, dodgeCancel: 80, steer: 9, lunge: [[4, 20, 0.5]], armor: true,
      hits: [{ f: [30, 31], every: ONCE, shape: 'circle', range: 4.0, dmg: 16, kb: 'launch', force: 3, lift: 6, hitstop: 6, heavy: true, rocks: 10 },
        { f: [50, 50], every: ONCE, shape: 'circle', range: 8.0, dmg: 14, kb: 'blow', force: 13, lift: 4, hitstop: 8, heavy: true, roar: true },
        { f: [52, 52], every: ONCE, dmg: 18, kb: 'blow', force: 12, lift: 5, hitstop: 3, heavy: true,
          proj: { count: 16, spread: 360, speed: 21, life: 32, r: 2.1, y: 0.9, kind: 'roar' } }] },

    dash: { frames: 72, cancel: 64, dodgeCancel: 46, steer: 3, lunge: [[0, 38, 6.6, 'lin'], [38, 46, 1.2]],
      hits: [{ f: [3, 36], every: 7, shape: 'arc', range: 2.4, ang: 140, dmg: 9, kb: 'push', force: 9, hitstop: 2 },
        { f: [42, 45], sweep: 1, shape: 'arc', range: 3.6, ang: 150, dmg: 22, kb: 'launch', force: 3, lift: 9, hitstop: 6, heavy: true }] },
    jatk: { frames: 22, air: true, hover: 2.4, next: 'ja2', charge: 'jc', cancel: 11, dodgeCancel: 99, steer: 3,
      hits: [{ f: [5, 8], every: ONCE, shape: 'arc', range: 3.3, ang: 130, dmg: 12, kb: 'flinch', force: 3, hitstop: 3, yMax: 4.5 }] },
    ja2: { frames: 25, air: true, hover: 2.3, next: 'ja3', charge: 'jc', cancel: 13, dodgeCancel: 99, steer: 3,
      hits: [{ f: [6, 9], sweep: -1, shape: 'arc', range: 3.4, ang: 210, dmg: 14, kb: 'push', force: 6, hitstop: 3, yMax: 4.5 }] },
    ja3: { frames: 30, air: true, hover: 1.4, next: 'jatk', charge: 'jc', cancel: 19, dodgeCancel: 99, steer: 3,
      hits: [{ f: [7, 14], every: ONCE, shape: 'circle', range: 3.6, dmg: 20, kb: 'blow', force: 9, lift: 3, hitstop: 4, yMax: 5 }] },
    // (jc: his own hang / landing timing — anims/locomotion.js reads the kit's jc for the squash and glow)
    jc: { frames: 60, air: true, hover: 3, landFrame: 38, hang: [5, 32], plunge: [32, -84], cancel: 54, dodgeCancel: 42, steer: 12, armor: true,
      hits: [{ f: [38, 41], every: ONCE, shape: 'circle', range: 5.2, dmg: 27, kb: 'launch', force: 6, lift: 9, hitstop: 8, heavy: true, rocks: 12 }] },
  };
}

export const entry = { n2: 'n1', n3: 'n2', n4: 'n3', n5: 'n4', n6: 'n5', c2: 'n1', c3: 'n2', c4: 'n3', c5: 'n4', c6: 'n5', ja2: 'jatk', ja3: 'ja2' };
// run: the spear trailed in the right hand, blade low behind him; the left arm pumps free
export const carry = { run: { spear: [-0.3, 1, -0.05, 175, -16, 90], gripR: 0, gripL: 0.6, lfree: 1 } };

// ---------------------------------------------------------------- pose helpers
// sp: the spear by the point between his hands (0.3 m up the shaft from the rear grip); roll 90 = the wavy blade edge-on
const sp = (x, y, z, yaw, elev, roll = 90) => spearAbout([x, y, z], yaw, elev, roll, 0.3);
// torso: twist (+ = turned left) spread over hips / spine / chest, the head held on the target
const torso = (tw, lean = 6, h = 0.84, z = 0.04) => ({ hips: [0, h, z], hipsR: [lean, -25 + tw * 0.6, 0], spine: [lean * 0.7, tw * 0.2, 0],
  chest: [lean * 0.4, tw * 0.2, 0], head: [-lean * 0.3, 22 - tw * 0.9, 0], gripR: 0, gripL: 0.6, lfree: 0 });
const G = { ...torso(-4, 8, 0.84), spear: sp(0.2782, 1.005, 0.2291, 14, -6, 90) };
// the spear in the right hand alone, trailed back along his right side
const TRAIL = { spear: [-0.34, 1, 0.02, 170, -28, 90], gripR: 0, gripL: 0.6, lfree: 1 };
const ROAR = { hips: [0, 0.8, 0.02], hipsR: [-14, -20, 0], spine: [-12, -4, 0], chest: [-22, 0, 0], head: [-32, 0, 0], lfree: 1, armL: [-20, 0, 70, 30] };
const PLANT = sp(-0.36, 1.133, 0.12, 0, 84);           // upright, the butt in the ground beside his lead foot
const AIRL = { fL: [0.15, 0.4, 0.18, -15, 10], fR: [-0.17, 0.28, -0.1, 25, -25] };

// Additional shaft path anchors carry the pole outside the torso during recovery turns.
// Frame + rear-grip position in pose metres; body timing and the baked foot tracks remain authored above.
const SHAFT_KEYS = {
  land: [
    [12, 0.114003, 1.087758, 0.112651], [13, 0.142171, 1.083743, 0.113670], [14, 0.115226, 1.128788, 0.114928], [15, 0.134503, 1.073139, 0.116361], [15.6, 0.109944, 1.186705, 0.152083],
    [16, 0.101169, 1.167009, 0.167917], [16.2, 0.111095, 1.203745, 0.163838], [16.8, 0.164489, 1.065882, 0.127618], [17, 0.166227, 1.060584, 0.119548], [17.4, 0.136006, 1.183169, 0.116612],
    [18, 0.030538, 1.254021, 0.121214], [18.6, -0.282931, 1.119673, 0.172215], [19, -0.305177, 1.097454, 0.122880], [19.2, -0.333059, 1.080552, 0.122410], [20, -0.340317, 1.040992, 0.124520],
    [21, -0.274394, 0.934726, 0.176111], [21.6, -0.342965, 0.992290, 0.148233], [22, -0.307019, 1.028726, 0.127633], [22.2, -0.306538, 1.025564, 0.124728], [22.8, -0.292673, 0.980156, 0.127993],
    [23, -0.287895, 0.973049, 0.129074], [23.4, -0.318740, 0.987652, 0.129226], [24, -0.266807, 1.017732, 0.130424],
  ],
  n1: [
    [21, 0.061714, 0.926147, 0.222926], [22, 0.048976, 0.947928, 0.269921], [23, 0.186807, 0.975196, 0.000549], [24, 0.169000, 1.001826, 0.031177],
  ],
  n2: [
    [23, 0.034274, 1.188545, 0.286774], [24, 0.066405, 1.160073, 0.271823], [25, 0.158458, 1.072810, 0.186818], [26, 0.200511, 1.035547, 0.051813], [27, 0.182642, 1.057074, -0.013137],
  ],
  n3: [
    [0, 0.010895, 1.209261, 0.334031], [1, -0.034163, 1.153460, 0.234955], [2, -0.106880, 1.063404, -0.186330], [6, -0.191124, 0.959073, -0.558540], [7, 0.239057, 1.019706, -0.001177],
    [8, 0.160405, 1.061170, 0.279949], [18, 0.174157, 1.137415, 0.280213], [19, 0.209934, 1.114120, 0.247162], [20, 0.200385, 1.024384, 0.197637], [21, -0.228385, 0.927676, 0.140206],
    [22, -0.287934, 0.987940, 0.087365], [23, -0.302157, 0.964644, 0.049004], [29, -0.209947, 0.973692, -0.027211], [30, -0.213315, 0.938250, -0.040520], [31, 0.194336, 1.004468, -0.050098],
    [32, 0.140968, 1.069026, -0.105973], [33, 0.159385, 1.029333, -0.058948],
  ],
  n4: [
    [1, -0.328346, 0.966092, 0.021277], [2, -0.333745, 1.081801, -0.079315], [3, -0.337656, 0.993181, 0.020257], [33, -0.221697, 1.007878, 0.002582], [34, -0.122335, 1.014494, -0.062048],
    [35, -0.011644, 1.021865, -0.078346], [36, 0.087718, 1.028481, -0.042976],
  ],
  n5: [
    [0, 0.206021, 1.036359, -0.060394], [1, 0.207213, 1.076554, -0.040131], [2, 0.263247, 1.158126, 0.001256], [3, -0.226160, 1.242563, 0.044510], [4, -0.090153, 1.311498, 0.080293],
  ],
  n6: [
    [1, 0.166889, 1.004129, -0.012112], [2, 0.141552, 0.939440, 0.131792], [3, 0.069870, 0.873586, 0.222688], [4, -0.031436, 0.821090, 0.239674], [13, 0.057752, 0.693262, 0.313742],
    [14, 0.077862, 0.651950, 0.407959], [15, -0.009572, 0.609275, 0.299296], [18, -0.086345, 0.657250, 0.245428], [19, -0.148366, 0.817097, 0.258618], [20, -0.205275, 1.009383, 0.273349],
    [21, -0.158982, 1.334123, 0.193666], [22, -0.160803, 1.515925, 0.121217], [23, -0.111599, 1.646969, 0.105972], [34, -0.040000, 1.844884, 0.119159], [35, -0.023929, 1.623312, 0.222970],
    [36, -0.020593, 1.466897, 0.200697], [55, 0.007080, 1.377672, 0.175727], [56, -0.005701, 1.363817, 0.131552], [57, 0.143011, 1.230245, 0.073737], [58, 0.191722, 1.146674, 0.015922],
    [59, 0.178941, 1.082819, -0.028253],
  ],
  c1: [
    [1, 0.159713, 1.036366, -0.096005], [2, 0.161349, 1.036407, -0.171649], [3, -0.246123, 0.986496, -0.254297], [4, -0.238910, 1.036630, -0.325652], [5, -0.207081, 1.036795, -0.378077],
    [11, -0.283441, 1.045723, -0.433306], [12, -0.282454, 1.068115, -0.372200], [13, -0.229776, 1.101750, -0.403133], [14, -0.224560, 1.143810, -0.325649], [15, -0.215962, 1.191477, -0.289293],
    [16, -0.203134, 1.221933, -0.293609], [17, -0.235232, 1.252358, -0.188141], [18, -0.211409, 1.299935, -0.172433], [22, -0.040000, 1.445394, 0.201908], [23, 0.064240, 1.240992, 0.383486],
    [24, 0.132883, 1.025457, 0.308780], [47, 0.136244, 0.887964, 0.286990], [48, 0.162456, 0.888222, 0.274392], [49, 0.132711, 0.838650, 0.258794], [50, 0.147494, 0.889306, 0.240351],
    [51, 0.207730, 0.940255, 0.219410], [52, 0.164713, 0.891555, 0.196483], [53, -0.280000, 0.793259, 0.172212], [54, -0.224713, 0.795405, 0.147321], [55, -0.217730, 0.798009, 0.122564],
    [56, -0.307494, 0.901061, 0.098668], [57, -0.292711, 0.904519, 0.076289], [58, -0.322456, 0.908310, 0.055966], [59, -0.296244, 0.912324, 0.038093], [69, -0.274580, 0.951386, -0.032201],
    [70, -0.234666, 0.919325, -0.040891], [71, -0.266989, 0.940628, -0.048626], [72, 0.150687, 1.010809, -0.054484], [73, 0.140601, 1.025740, -0.058142],
  ],
  c2: [
    [3, 0.196183, 0.987665, -0.034205], [4, 0.188045, 0.957071, 0.035872], [5, 0.177174, 0.923846, 0.061439], [6, 0.163387, 0.890719, 0.092387], [7, 0.146502, 0.860419, 0.128605],
    [8, 0.126337, 0.835676, 0.119985], [9, 0.092565, 0.768653, 0.185285], [10, 0.050389, 0.762382, 0.140922], [11, -0.287273, 0.813521, 0.092531], [12, -0.234635, 0.915022, 0.142887],
    [13, -0.285570, 0.939203, 0.143748], [14, -0.292116, 0.947978, 0.144060], [15, -0.259883, 0.949684, 0.144125], [16, -0.309885, 0.950000, 0.144139], [17, -0.259948, 1.008102, 0.157198],
    [18, -0.309980, 1.076950, 0.180357], [19, -0.259993, 1.134878, 0.202045], [47, -0.245524, 1.096935, 0.180961], [48, -0.268641, 1.094138, 0.170229], [49, -0.254165, 1.084668, 0.149774],
    [50, -0.227425, 1.023398, 0.108098], [51, -0.226989, 1.011027, 0.056064], [52, 0.223446, 1.049881, 0.005325], [53, 0.200186, 0.991899, -0.032879], [54, 0.191948, 1.037729, -0.053487],
  ],
  c3: [
    [26, 0.172993, 1.046785, 0.364505], [27, 0.134287, 1.142347, 0.407622], [28, -0.157713, 1.274626, 0.228884], [52, -0.075000, 1.493214, 0.171892], [53, 0.037662, 1.344014, 0.311872],
    [54, 0.115426, 1.197232, 0.214601], [55, 0.155662, 1.026862, 0.296855],
  ],
  c4: [
    [1, 0.175367, 1.035421, -0.054917], [2, 0.200621, 1.032921, -0.040874], [3, -0.197115, 0.979278, -0.021310], [4, -0.152295, 0.974849, -0.048622], [5, -0.254049, 1.019938, -0.024659],
    [6, -0.295369, 1.064798, -0.150803], [7, -0.372360, 0.959644, 0.271948], [8, -0.433559, 0.954652, 0.142911], [9, -0.479318, 0.999965, 0.111648], [45, -0.494236, 0.916753, 0.273845],
    [46, -0.492517, 0.867275, 0.269531], [47, -0.490486, 0.917893, 0.267982], [48, -0.486507, 0.919103, 0.297749], [49, -0.481500, 0.870625, 0.276324], [50, -0.475386, 0.922484, 0.304175],
    [51, -0.468127, 0.924691, 0.381795], [52, -0.459730, 0.927244, 0.359676], [53, -0.450260, 0.930124, -0.061714], [54, -0.439847, 0.983290, -0.081952], [55, -0.528680, 0.936685, -0.000683],
    [56, -0.417019, 0.940231, -0.017628], [57, -0.455181, 0.943830, 0.017406], [58, -0.393540, 0.947370, 0.004530], [59, -0.432513, 0.950722, 0.043775], [60, -0.372544, 0.953754, 0.035112],
    [66, -0.269495, 0.976351, 0.012083], [67, -0.264160, 0.984752, 0.003086], [68, -0.171377, 0.988374, -0.017188], [69, -0.154489, 0.953804, -0.082305], [70, 0.159156, 0.968249, 0.054700],
    [71, 0.194577, 1.028856, -0.054305], [72, 0.190604, 1.034489, -0.058905],
  ],
  c5: [
    [1, 0.189540, 1.042385, -0.043781], [2, 0.200614, 1.056618, -0.003732], [3, 0.201716, 1.074499, 0.047989], [4, 0.251514, 1.092855, 0.102986], [5, -0.194421, 1.109652, 0.105628],
    [6, -0.132982, 1.073752, 0.302491], [7, -0.112942, 1.134707, 0.291859], [8, -0.084438, 1.142567, 0.273273], [35, -0.281658, 1.126656, 0.318605], [36, -0.292954, 1.021586, 0.342216],
    [37, -0.204251, 0.841795, 0.421382], [38, -0.186658, 0.774364, 0.447771], [39, -0.258509, 0.675475, 0.419993], [40, -0.147250, 0.635920, 0.428882], [41, 0.052222, 0.637677, 0.364464],
    [42, 0.152813, 0.809921, 0.330409], [62, 0.300000, 1.600000, 0.120000], [63, 0.196979, 0.687407, 0.423848], [64, 0.173151, 0.551701, 0.446404],
  ],
  c6: [
    [1, 0.176384, 1.042299, -0.020482], [2, 0.211340, 1.057523, 0.064296], [3, -0.013249, 1.028551, 0.356924], [4, -0.082222, 1.052413, 0.286895], [5, -0.088248, 1.126620, 0.295651],
    [13, -0.240328, 1.348104, 0.303869], [14, -0.201749, 1.360536, 0.320380], [15, -0.310064, 1.569092, 0.236890], [16, -0.315598, 1.518030, 0.157676], [17, -0.268680, 1.551605, 0.187013],
    [20, -0.024992, 1.431959, 0.219673], [21, -0.015568, 1.301749, 0.337787], [22, 0.185609, 1.294377, 0.246259], [23, 0.149047, 1.261929, 0.248484], [24, 0.150000, 1.251643, 0.248641],
    [25, -0.168571, 0.988132, 0.214384], [26, -0.308163, 0.865608, 0.104904], [97, -0.205837, 0.918761, 0.087088], [98, -0.223998, 0.944085, 0.059496], [99, 0.178011, 0.973687, 0.023385],
    [100, 0.177391, 1.001464, -0.012727], [101, 0.152179, 1.021893, -0.040319],
  ],
  dash: [
    [0, 0.206021, 1.036359, -0.060394], [1, -0.072168, 0.976829, -0.073627], [2, -0.217340, 1.062869, -0.134124], [3, -0.348699, 0.891644, 0.028985], [36, -0.355000, 0.890000, 0.030000],
    [37, -0.398510, 0.874782, 0.128587], [38, 0.053639, 0.792606, 0.340954], [42, 0.158313, 0.920000, 0.315764], [43, -0.019824, 1.152103, 0.405287], [44, -0.007736, 1.204255, 0.372081],
    [67, 0.047895, 1.175916, 0.325229], [68, 0.052652, 1.077810, 0.392303], [69, 0.207109, 1.029704, 0.059377], [70, 0.192494, 1.048359, -0.027234],
  ],
  jatk: [
    [4, -0.189651, 1.437868, 0.172257], [5, -0.326598, 1.247999, 0.172616], [6, -0.302324, 1.179864, 0.172628], [12, -0.284214, 1.145055, 0.159367], [13, -0.329367, 1.136090, 0.152320],
    [14, -0.277428, 1.125750, 0.143977], [15, -0.315423, 1.111248, 0.130837], [16, -0.253419, 1.097634, 0.117696],
  ],
  ja2: [
    [7, -0.065364, 1.083955, 0.303711], [8, 0.114930, 1.087440, 0.314568], [9, 0.078742, 1.090000, 0.317394],
  ],
  ja3: [
    [18, -0.432591, 1.099438, 0.266275], [19, -0.442212, 1.099008, 0.290503], [20, -0.454499, 1.098460, 0.307592], [21, -0.468616, 1.097830, 0.369779], [22, -0.483384, 1.097170, -0.069779],
    [23, -0.497501, 1.096540, -0.007592], [24, -0.509788, 1.095992, 0.009497], [25, -0.519409, 1.095562, 0.033725],
  ],
  jc: [
    [27, -0.101815, 1.795385, 0.324617], [28, -0.127437, 1.684165, 0.345997], [29, -0.062030, 1.603595, 0.354149],
  ],
  hurt: [
    [3.6, -0.325729, 1.252133, -0.021579], [4.2, -0.366546, 1.269216, -0.031722], [4.8, -0.310385, 1.280679, -0.038528], [27, -0.311110, 1.279329, -0.037727], [27.6, -0.365623, 1.270935, -0.032743],
    [28.2, -0.320439, 1.261975, -0.027422], [28.8, -0.325505, 1.252549, -0.021826], [29.4, -0.380772, 1.242750, -0.016008], [30, -0.336193, 1.232664, -0.010019],
  ],
};

export function clips(A, M) {
  const { clipF, lungeAt: lz, body, ft, hit } = A;
  const stand = (id, f, w = 1) => ({ fL: [0.27 * w, 0.08, lz(id, f) + 0.3 * w, 0, 20], fR: [-0.29 * w, 0.08, lz(id, f) - 0.27 * w, 0, -45] });
  const reach = (id, f, d = 0.7) => ({ fL: [0.2, 0.08, lz(id, f) + d, 0, 6], fR: [-0.25, 0.08, lz(id, f) - 0.42, 0, -58] });
  const kneeL = (id, f, y = 0.32) => ({ fL: [0.2, y, lz(id, f) + 0.32, -25, 12] });
  const kneeR = (id, f, y = 0.32) => ({ fR: [-0.22, y, lz(id, f) - 0.05, -25, -30] });
  const out = {};
  const frame = (id) => ({ F: M[id].frames, c: M[id].cancel });

  // N1 flat swing right → left at the waist
  { const [s, e] = hit('n1'), { F, c } = frame('n1');
    out.n1 = clipF('n1', [[0, G],
      [s - 4, { ...torso(-50, 8, 0.82), spear: sp(-0.2067, 0.925, 0.2316, -110, 4, 0) }, 'out'],
      [s, { ...torso(-20, 10, 0.8), spear: sp(-0.1185, 0.92, 0.4, -60, 0, 0), ...reach('n1', s, 0.6) }, 'in'],
      [e + 1, { ...torso(40, 10, 0.8), spear: sp(0.1142, 0.88, 0.2374, 85, -4, 0) }, 'snap'],
      [c, { ...torso(48, 8, 0.82), spear: sp(0.2992, 0.865, 0.2356, 95, -8, 0) }, 'io'], [F, G]]); }
  // N2 rising backhand left → right, from N1's follow-through
  { const [s, e] = hit('n2'), { F, c } = frame('n2');
    out.n2 = clipF('n2', [[0, { ...torso(48, 8, 0.82), spear: sp(0.2992, 0.865, 0.2356, 95, -8, 0) }],
      [s - 3, { ...torso(55, 12, 0.74), spear: sp(0.2067, 0.72, 0.2316, 110, -25, 0) }, 'out'],
      [s, { ...torso(30, 6, 0.8), spear: sp(0.1105, 0.905, 0.4, 60, -10, 0), ...reach('n2', s, 0.65) }, 'in'],
      [e + 1, { ...torso(-40, -4, 0.9), spear: sp(-0.0647, 1.34, 0.2947, -80, 38, 0) }, 'snap'],
      [c, { ...torso(-45, -2, 0.9), spear: sp(-0.2112, 1.41, 0.3146, -95, 42, 0) }, 'io'], [F, G]]); }
  // N3 two-handed driving thrust off a long step
  { const [s, e] = hit('n3'), { F, c } = frame('n3');
    out.n3 = clipF('n3', [[0, { ...torso(-45, -2, 0.9), spear: sp(-0.2112, 1.41, 0.3146, -95, 42, 0) }],
      [s - 5, { ...torso(-55, 0, 0.86, -0.08), spear: sp(-0.212, 0.98, -0.26, -4, 4) }, 'out'],
      [s, { ...torso(-12, 16, 0.72, 0.3), spear: sp(0.182, 1.06, 0.62, 0, -3), ...reach('n3', s, 0.85) }, 'snap'],
      [e + 3, { ...torso(-10, 14, 0.74, 0.28), spear: sp(0.197, 1.13, 0.6, 0, -3) }, 'io'],
      [c, { ...torso(-20, 8, 0.8, 0.18), spear: sp(-0.325, 0.925, 0.32, 0, -6) }, 'io'], [F, G]]); }
  // N4 the left haymaker, spear trailed in the right hand
  { const [s, e] = hit('n4'), { F, c } = frame('n4');
    out.n4 = clipF('n4', [[0, { ...torso(-20, 8, 0.8, 0.18), spear: sp(-0.325, 0.925, 0.32, 0, -6) }],
      [s - 5, { ...torso(-55, 4, 0.84, -0.04), ...TRAIL, armL: [30, 0, 30, 120] }, 'out'],
      [s, { ...torso(30, 14, 0.76, 0.24), ...TRAIL, armL: [-88, 0, 14, 6], ...reach('n4', s, 0.75) }, 'snap'],
      [e + 2, { ...torso(36, 14, 0.76, 0.26), ...TRAIL, armL: [-84, 0, 16, 10] }, 'io'],
      [c, { ...torso(10, 8, 0.82, 0.16), ...TRAIL, armL: [-30, 0, 30, 70] }, 'io'], [F, G]]); }
  // N5 chop from over the right shoulder
  { const [s] = hit('n5'), { F, c } = frame('n5');
    out.n5 = clipF('n5', [[0, G],
      [s - 8, { ...torso(-20, -10, 0.94, -0.02), spear: sp(-0.145, 1.62, -0.08, 0, 135) }, 'out'],
      [s - 2, { ...torso(-18, -14, 0.98, 0), spear: sp(-0.092, 1.688, -0.04, 0, 150) }, 'io'],
      [s + 1, { ...torso(-8, 24, 0.64, 0.26), spear: sp(0, 1.23, 0.5, 0, -30), ...stand('n5', s + 1, 1.15) }, 'snap'],
      [c, { ...torso(-8, 20, 0.68, 0.22), spear: sp(0.16, 1, 0.48, 0, -26) }, 'io'], [F, G]]); }
  // N6 low leg sweep, a hop, the blade stabbed down into the ground
  { const [s, e] = hit('n6', 0), [s2] = hit('n6', 1), { F, c } = frame('n6');
    const stab = { ...torso(0, 26, 0.6, 0.24), spear: sp(-0.02, 1.212, 0.42, 0, -45) };
    out.n6 = clipF('n6', [[0, G],
      [s - 4, { ...torso(-60, 14, 0.66), spear: sp(-0.3275, 0.68, 0.16, -120, -14, 0) }, 'out'],
      [s, { ...torso(-40, 16, 0.62), spear: sp(-0.2167, 0.65, 0.2653, -100, -14, 0), ...stand('n6', s, 1.2) }, 'in'],
      [e + 1, { ...torso(55, 16, 0.62), spear: sp(0.1994, 0.5, 0.1525, 115, -12, 0) }, 'lin'],
      [s2 - 12, { ...torso(10, -6, 0.92, 0.04), spear: sp(-0.112, 1.55, 0.24, 0, -60) }, 'out'],
      [s2 - 6, { ...torso(4, -10, 1.0, 0.08), spear: sp(-0.04, 1.58, 0.26, 0, -62), ...kneeL('n6', s2 - 6, 0.4) }, 'io'],
      [s2, { ...stab, ...stand('n6', s2, 1.2) }, 'snap'],
      [c, { ...stab, hips: [0, 0.66, 0.2] }, 'io'], [F, G]]); }

  // C1 裂地: wound back over the head, the knee up, then the whole spear slammed flat ahead
  { const [s] = hit('c1'), { F, c } = frame('c1');
    out.c1 = clipF('c1', [[0, G],
      [10, { ...torso(-30, 6, 0.8, -0.06), spear: sp(-0.38, 1.14, -0.172, -20, 20) }, 'out'],
      [22, { ...torso(-6, -16, 0.86, 0.02), spear: sp(-0.04, 1.548, -0.08, 0, 160), ...kneeL('c1', 22) }, 'io'],
      [s, { ...torso(0, 30, 0.58, 0.3), spear: sp(0.173, 0.8, 0.603, 0, -18), ...reach('c1', s, 0.9) }, 'snap'],
      [s + 10, { ...torso(0, 28, 0.6, 0.3), spear: sp(0.18, 0.8, 0.6, 0, -17) }, 'io'],
      [c, { ...torso(-8, 14, 0.76, 0.18), spear: sp(-0.34, 0.88, 0.28, 0, -10) }, 'io'], [F, G]]); }
  // C2 scoop: dragged low on the right, flung up through them
  { const [s] = hit('c2'), { F, c } = frame('c2');
    out.c2 = clipF('c2', [[0, G],
      [s - 6, { ...torso(-45, 18, 0.66, -0.04), spear: sp(-0.1905, 0.7, 0.28, -60, -22, 90) }, 'out'],
      [s, { ...torso(-10, 6, 0.82, 0.2), spear: sp(-0.305, 1.1, 0.4, -10, 30), ...reach('c2', s, 0.7) }, 'snap'],
      [s + 8, { ...torso(0, -12, 0.96, 0.22), spear: sp(-0.26, 1.5, 0.293, 0, 78) }, 'out'],
      [c, { ...torso(0, -8, 0.94, 0.18), spear: sp(-0.26, 1.385, 0.28, 0, 72) }, 'io'], [F, G]]); }
  // C3 three chops walking forward: over the left shoulder, the right, then both hands high and down
  { const [a] = hit('c3', 0), [b] = hit('c3', 1), [d] = hit('c3', 2), { F, c } = frame('c3');
    const upL = sp(0.197, 1.663, -0.13, 30, 130), dnL = sp(0.08, 0.92, 0.62, -20, -25), upR = sp(-0.2, 1.6, 0.005, -30, 130), dnR = sp(-0.177, 1.01, 0.66, 20, -25);
    const slam = { ...torso(0, 30, 0.58, 0.3), spear: sp(0.18, 0.845, 0.6, 0, -20) };
    out.c3 = clipF('c3', [[0, G],
      [a - 6, { ...torso(30, -8, 0.92), spear: upL }, 'out'],
      [a, { ...torso(-25, 20, 0.7, 0.2), spear: dnL, ...reach('c3', a, 0.6) }, 'snap'],
      [a + 8, { ...torso(-25, 18, 0.72, 0.18), spear: dnL }, 'io'],
      [b - 7, { ...torso(-35, -8, 0.92), spear: upR }, 'out'],
      [b, { ...torso(25, 20, 0.7, 0.2), spear: dnR, ...stand('c3', b, 1.1) }, 'snap'],
      [b + 8, { ...torso(25, 18, 0.72, 0.18), spear: dnR }, 'io'],
      [d - 10, { ...torso(-5, -16, 1.0), spear: sp(-0.075, 1.62, -0.1, 0, 155), ...kneeL('c3', d - 10) }, 'out'],
      [d, { ...slam, ...stand('c3', d, 1.2) }, 'snap'],
      [c, { ...slam, hips: [0, 0.63, 0.27] }, 'io'], [F, G]]); }
  // C4 one full turn, the spear held at the butt at arm's length; the left foot pivots, the right steps round
  { const [s, e] = hit('c4'), { F, c } = frame('c4');
    const turn = (f) => 360 * Math.min(1, Math.max(0, (f - s) / (e - s)));
    const OUT = { ...torso(0, 6, 0.76), spear: [-0.5, 0.915, 0.36, -88, 4, 0], gripL: -0.3 };
    const keys = [[0, G], [s - 8, { ...torso(-50, 10, 0.78), spear: [-0.552, 0.983, 0.172, -130, 6, 0], gripL: -0.3 }, 'out']];
    for (let f = s; f <= e; f += 2) keys.push([f, { ...OUT, spin: turn(f) }, 'lin']);
    for (const q of [0.25, 0.5, 0.75, 1]) { const f = Math.round(s + q * (e - s)); keys.push(ft(f, null, body('c4', f, turn(f), [-0.3, 0.08, -0.24, 0, -40]))); }
    keys.push([c, { ...torso(-30, 8, 0.8), spear: [-0.352, 0.96, 0.02, -60, 0, 0], gripL: -0.3, spin: 360 }, 'io'],
      [F, { ...G, spin: 360 }], ft(F, ...Object.values(stand('c4', F))));
    out.c4 = clipF('c4', keys); }
  // C5 the butt stamped down on the left, then the right, then the shaft slammed flat across the front
  { const [a] = hit('c5', 0), [b] = hit('c5', 1), [d] = hit('c5', 2), { F, c } = frame('c5');
    const flat = { ...torso(0, 28, 0.56, 0.2), spear: sp(-0.128, 0.54, 0.45, -90, 0, 0), ...stand('c5', d, 1.3) };
    out.c5 = clipF('c5', [[0, G],
      [a - 6, { ...torso(-10, -6, 0.92), spear: sp(-0.12, 1.45, 0.38, -10, 82), ...kneeL('c5', a - 6) }, 'out'],
      [a, { ...torso(-10, 14, 0.66, 0.12), spear: sp(-0.085, 0.98, 0.42, -10, 82), ...stand('c5', a, 1.2) }, 'snap'],
      [b - 6, { ...torso(10, -6, 0.92), spear: sp(-0.092, 1.467, 0.3, 10, 82), ...kneeR('c5', b - 6) }, 'out'],
      [b, { ...torso(10, 14, 0.66, 0.12), spear: sp(0.06, 0.933, 0.42, 10, 82), ...stand('c5', b, 1.25) }, 'snap'],
      [d - 12, { ...torso(0, -14, 1.04, 0.04), spear: sp(0.057, 1.637, 0.1, -90, 0, 0) }, 'out'],
      [d - 4, { ...torso(0, -16, 1.06, 0.06), spear: sp(0, 1.6, 0.12, -90, 0, 0), ...kneeL('c5', d - 4, 0.38) }, 'io'],
      [d, flat, 'snap'],
      [c, { ...flat, hips: [0, 0.62, 0.18] }, 'io'], [F, G]]); }
  // C6 當陽一喝: swung up round the left, over the head, planted upright — a breath over it — and the roar
  { const [a] = hit('c6', 0), [r] = hit('c6', 1), { F, c } = frame('c6');
    const hold = { ...torso(-6, 12, 0.7, 0.12), spear: PLANT, gripL: 0.42 };
    out.c6 = clipF('c6', [[0, G],
      [10, { ...torso(35, 4, 0.86), spear: sp(0.0717, 1.345, 0.4067, 80, 30, 0) }, 'out'],
      [18, { ...torso(0, -8, 0.98), spear: sp(-0.12, 1.585, -0.08, 150, 4, 0) }, 'lin'],
      [24, { ...torso(0, -14, 1.0, 0.06), spear: sp(0.15, 1.55, 0.28, 0, 84), ...kneeL('c6', 24) }, 'out'],
      [a, { ...hold, ...stand('c6', a, 1.3) }, 'snap'],
      [a + 8, { ...hold, hips: [0, 0.68, 0.14] }, 'io'],
      [r - 5, { ...hold, hips: [0, 0.76, 0.08], head: [14, 22, 0] }, 'in'],
      [r, { ...ROAR, spear: PLANT, gripR: 0, gripL: 0.42 }, 'snap'],
      [r + 24, { ...ROAR, chest: [-26, 0, 0], head: [-36, 0, 0], spear: PLANT, gripR: 0, gripL: 0.42, armL: [-30, 0, 78, 24] }, 'io'],
      [c, { ...torso(-10, 6, 0.82, 0.08), spear: sp(-0.28, 1.12, 0.3, 0, 50) }, 'io'], [F, G]]); }

  // dash: head down, left shoulder first, the spear trailed low; at the end a rising swing right → left
  { const [s2, e2] = hit('dash', 1), { F, c } = frame('dash');
    const rush = { ...torso(25, 26, 0.76, 0.16), ...TRAIL, spear: [-0.355, 0.89, 0.03, -170, -14, 90], armL: [-40, 0, 40, 70] };
    const keys = [[0, G], [4, rush, 'out'], [36, { ...rush, hips: [0, 0.74, 0.18] }]];
    for (let f = 4, k = 0; f < 38; f += 6, k++) {
      const z = lz('dash', f) + 0.35;
      keys.push(k % 2 ? ft(f, null, [-0.16, 0.08, z, 0, -8]) : ft(f, [0.16, 0.08, z, 0, 8], null));
    }
    keys.push([s2 - 4, { ...torso(-40, 14, 0.7), spear: sp(-0.1905, 0.69, 0.2, -120, -20, 0) }, 'in'],
      [s2, { ...torso(-15, 10, 0.78, 0.16), spear: sp(-0.0715, 0.92, 0.5086, -50, 0, 0), ...stand('dash', s2, 1.1) }, 'in'],
      [e2 + 1, { ...torso(40, -6, 0.9, 0.2), spear: sp(0.2167, 1.4, 0.4147, 80, 40, 0) }, 'snap'],
      [c, { ...torso(44, -4, 0.88, 0.16), spear: sp(0.22, 1.42, 0.445, 90, 42, 0) }, 'io'], [F, G]);
    out.dash = clipF('dash', keys); }

  // air: chop down from over the right shoulder · flat backhand left → right · a whirl at arm's length
  { const [s, e] = hit('jatk'), F = M.jatk.frames;
    out.jatk = clipF('jatk', [[0, { ...torso(-10, 0, 0.95), ...AIRL, spear: sp(-0.285, 1.42, -0.08, -30, 120) }],
      [s - 1, { ...torso(-20, -6, 0.96), ...AIRL, spear: sp(-0.1, 1.65, -0.02, -25, 135) }, 'out'],
      [e, { ...torso(10, 16, 0.92, 0.08), ...AIRL, spear: sp(-0.24, 1, 0.41, 15, -35) }, 'snap'],
      [F, { ...torso(10, 14, 0.93, 0.06), ...AIRL, spear: sp(-0.16, 0.92, 0.34, 15, -30) }]]); }
  { const [s, e] = hit('ja2'), F = M.ja2.frames;
    out.ja2 = clipF('ja2', [[0, { ...torso(10, 14, 0.93, 0.06), ...AIRL, spear: sp(-0.16, 0.92, 0.34, 15, -30) }],
      [s - 1, { ...torso(55, 6, 0.95), ...AIRL, spear: sp(0.1725, 1.05, 0.2082, 105, -6, 0) }, 'out'],
      [e, { ...torso(-50, 6, 0.95), ...AIRL, spear: sp(-0.2167, 1.09, 0.2653, -100, 0, 0) }, 'in'],
      [F, { ...torso(-45, 4, 0.95), ...AIRL, spear: sp(-0.3267, 1.1, 0.1916, -110, 2, 0) }]]); }
  { const [s, e] = hit('ja3'), F = M.ja3.frames;
    const W = { ...torso(0, 4, 0.95), ...AIRL, spear: [-0.42, 1.1, 0.3, -88, 2, 0], gripL: -0.3 };
    const keys = [[0, { ...torso(-45, 4, 0.95), ...AIRL, spear: sp(-0.3267, 1.1, 0.1916, -110, 2, 0) }],
      [s - 2, { ...torso(-40, 4, 0.95), ...AIRL, spear: [-0.36, 1.1, 0.06, -140, 4, 0], gripL: -0.3 }, 'out']];
    for (let f = s; f <= e; f += 2) keys.push([f, { ...W, spin: 360 * (f - s) / (e - s) }, 'lin']);
    keys.push([F, { ...W, spin: 360, spear: [-0.532, 1.095, 0, -70, 0, 0] }]);
    out.ja3 = clipF('ja3', keys); }
  // jump charge: twirled flat over the head through the hang, then dropped point-first, driven into the ground
  { const L = M.jc.landFrame, F = M.jc.frames, [h0] = M.jc.hang, D = M.jc.plunge[0], c = M.jc.cancel;
    const legs = (y) => ({ fL: [0.15, y, 0.16, -25, 10], fR: [-0.17, y - 0.1, -0.1, 15, -25] });
    const over = (f, yaw) => [f, { ...torso(0, -6, 0.98), ...legs(0.46), spear: sp(0, 1.88, 0, yaw, 3, 0), lfree: 0.4 }, 'lin'];
    const down = { ...torso(0, 26, 0.58, 0.18), spear: sp(0.18, 0.85, 0.42, 0, -50), fL: [0.32, 0.08, 0.34, 0, 22], fR: [-0.32, 0.08, -0.28, 0, -48] };
    const keys = [[0, { ...torso(0, 0, 0.95), ...legs(0.36), spear: sp(-0.285, 1.42, -0.08, -30, 120) }]];
    for (let f = h0, k = 0; f <= D - 4; f += 3, k++) keys.push(over(f, 90 + k * 60));
    keys.push([D, { ...torso(0, 10, 0.96, 0.06), ...legs(0.42), spear: sp(-0.04, 1.27, 0.46, 0, -72) }, 'out'],
      [L - 1, { ...torso(0, 14, 0.94, 0.1), ...legs(0.36), spear: sp(0.04, 1.28, 0.52, 0, -68) }, 'in'],
      [L, down, 'snap'],
      [c, { ...down, hips: [0, 0.66, 0.14] }, 'io'], [F, G]);
    out.jc = clipF('jc', keys); }

  // locomotion: the spear stood upright at his right side, the left fist on the hip; take-off / apex / fall / land / hurt
  Object.assign(out, locoClips({
    idle: { hips: [0, 0.87, 0], hipsR: [0, -18, 0], spine: [0, -2, 0], chest: [-6, -2, 0], head: [-6, 8, 0],
      footL: [0.27, 0.08, 0.18, 0, 24], footR: [-0.27, 0.08, -0.12, 0, -28], spear: [-0.472, 0.98, 0.14, 4, 84, 90], gripR: 0, gripL: 0.4, lfree: 1, armL: [8, 0, 50, 98] },
    breath: { hips: [0, 0.858, 0], chest: [-4, -2, 0], head: [-8, 8, 0] },
    takeoff: { hips: [0, 0.97, 0], hipsR: [-4, -16, 0], chest: [-8, 2, 0], head: [-4, 0, 0], spear: [-0.3, 1.2, 0.05, 10, 70, 90], gripL: 0.4, lfree: 1, armL: [-10, 0, 55, 50] },
    apex: { hips: [0, 0.95, 0], hipsR: [-6, -6, 0], chest: [-10, 0, 0], head: [-6, 0, 0], spear: sp(-0.2, 1.52, -0.08, -30, 110), gripL: 0.6 },
    fall: { hips: [0, 0.95, 0], hipsR: [-8, -4, 0], chest: [-6, 0, 0], head: [12, 0, 0], spear: [-0.36, 1.25, 0.12, -100, 14, 90], gripL: 0.3, lfree: 1, armL: [-10, 0, 95, 20] },
    land: { ...torso(-6, 22, 0.6, 0.12), spear: sp(0.14, 0.92, 0.36, 6, -34), footL: [0.32, 0.08, 0.34, 0, 22], footR: [-0.32, 0.08, -0.28, 0, -48] },
    hurt: { hips: [0, 0.84, -0.1], hipsR: [-14, -30, 4], spine: [-10, 0, 0], chest: [-14, 0, 0], head: [-18, 6, 0], spear: [-0.3, 1.3, -0.05, 150, 30, 90], gripL: 0.3, lfree: 1, armL: [-20, 0, 80, 50] },
  }));
  for (const [id, anchors] of Object.entries(SHAFT_KEYS)) {
    const c = out[id], F = M[id]?.frames || 60;
    const additions = anchors.map(([f, x, y, z]) => {
      const p = new Float32Array(POSE_SIZE), t = f / F;
      sampleClip(c, t, p);
      if (c.feet) { const dip = new Float32Array(POSE_SIZE); c.feet(t, dip); p[1] -= dip[1]; }
      p.set([x, y, z], 25);
      return { t, p, e: (u) => u };
    });
    c.keys = c.keys.filter((k) => !additions.some((a) => Math.abs(a.t - k.t) < 1e-8)).concat(additions).sort((a, b) => a.t - b.t);
  }
  // Ground spots are metres; undo this officer's 1.13 body scale before the rig scales them.
  for (const c of Object.values(out)) if (c.feet) {
    const feet = c.feet;
    c.feet = (t, p) => { feet(t, p); for (const i of [15, 17, 20, 22]) p[i] /= 1.13; };
  }
  return out;
}

// ---------------------------------------------------------------- 真・無雙 燕人咆哮 (musou/scripted.js)
const MH = (dmg, kb, force, lift, extra) => ({ shape: 'circle', range: 5, dmg, kb, force, lift, hitstop: 0, yMax: 5, ...extra });
const RING = (count, dmg) => ({ dmg, kb: 'blow', force: 13, lift: 5, hitstop: 0, heavy: true, proj: { count, spread: 360, speed: 23, life: 34, r: 2.3, y: 0.9, kind: 'roar' } });
export const musou = {
  act: { ...ROAR, spear: [-0.4, 0.92, 0.06, -50, 50, 90], gripL: 0.3 },
  act2: { ...ROAR, chest: [-26, 0, 0], head: [-38, 0, 0], spear: [-0.4, 0.92, 0.06, -50, 50, 90], gripL: 0.3, armL: [-34, 0, 80, 22] },
  face: { hips: [0, 0.9, 0], hipsR: [0, -20, 0], spine: [0, -4, 0], chest: [-6, -6, 0], head: [-8, -14, 0], spear: [-0.508, 1.043, -0.025, 10, 76, 90], gripL: 0.4, lfree: 1, armL: [-24, 0, 64, 64] },
  ready: { ...torso(-30, 16, 0.7), spear: [-0.45, 1.16, 0.1, 10, 76, 90], lfree: 1, armL: [-24, 0, 64, 64] },
  // the roar (100-112, c6's) · bull rush (112-132, CONTACT on the line) · three chops (132-152) · a turn (152-166) ·
  // the shaft hoisted (166-176) · FINISHER: slammed flat (c5's last), a second roar ring
  seq: [[100, 112, 'c6', 0.44, 0.58], [112, 128, 'dash', 0.04, 0.5], [128, 132, 'dash', 0.56, 0.64], [132, 152, 'c3', 0.12, 0.7],
    [152, 166, 'c4', 0.28, 0.5], [166, 176, 'c5', 0.5, 66 / 98]],
  fin: ['c5', 66 / 98, 88 / 98],
  travel: [[112, 128, 5.5], [132, 152, 2.0], [152, 166, 0.6]],
  hits: [[104, MH(10, 'blow', 14, 4, { range: 8.5, heavy: true, hitstop: 4 })],
    [113, MH(9, 'push', 9, 2, { shape: 'arc', range: 2.8, ang: 140 }), 0, 4, 128],
    [132, MH(18, 'blow', 12, 5, { shape: 'line', len: 5.5, width: 3.6, heavy: true, hitstop: 3 })],
    [140, MH(14, 'push', 8, 2, { shape: 'arc', range: 4.2, ang: 110 }), 1.2],
    [147, MH(16, 'blow', 10, 4, { shape: 'arc', range: 4.4, ang: 120, heavy: true }), 1.2],
    [158, MH(8, 'spin', 7, 3, { range: 5.4 }), 0, 3, 164]],
  proj: [[104, RING(16, 9)]],
  fx: [[104, 'roar', 11], [132, 'crack', 4, 2.5], [147, 'slam', 5, 2]],
  finFx: [['slam', 13], ['rocks', 13], ['roar', 12]],
  finProj: [RING(20, 12)],
};
