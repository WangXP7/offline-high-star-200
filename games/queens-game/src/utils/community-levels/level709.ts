import {
  anakiwa,
  atomicTangerine,
  bittersweet,
  celadon,
  halfBaked,
  lightOrchid,
  macNCheese,
  periwinkle,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/709",
  size: 10,
  colorRegions: [
    ["G", "G", "H", "G", "J", "F", "J", "G", "E", "I"],
    ["H", "H", "H", "H", "H", "C", "E", "B", "E", "B"],
    ["G", "B", "H", "G", "F", "F", "E", "E", "E", "E"],
    ["G", "H", "H", "H", "B", "B", "E", "G", "E", "G"],
    ["G", "G", "A", "A", "A", "I", "I", "D", "E", "I"],
    ["G", "F", "G", "A", "G", "D", "D", "D", "D", "D"],
    ["G", "A", "A", "A", "A", "A", "I", "D", "G", "I"],
    ["G", "G", "G", "A", "G", "F", "D", "D", "D", "I"],
    ["I", "G", "G", "G", "G", "J", "G", "G", "G", "F"],
    ["G", "I", "F", "F", "B", "J", "J", "I", "G", "B"],
  ],
  regionColors: {
    A: bittersweet,
    B: periwinkle,
    C: anakiwa,
    D: macNCheese,
    E: atomicTangerine,
    F: celadon,
    G: halfBaked,
    H: lightOrchid,
    I: white,
    J: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "VictorBandoiu",
  creatorLink: "https://www.instagram.com/victorban72/",
};

export default level;
