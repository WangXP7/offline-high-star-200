import {
  altoMain,
  anakiwa,
  atomicTangerine,
  bittersweet,
  celadon,
  chardonnay,
  lightGreen,
  lightOrchid,
  lightWisteria,
  periwinkle,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/643",
  size: 11,
  colorRegions: [
    ["K", "K", "J", "J", "K", "K", "K", "A", "K", "K", "J"],
    ["K", "K", "J", "J", "J", "K", "I", "I", "B", "K", "J"],
    ["K", "B", "I", "I", "J", "K", "I", "I", "I", "J", "C"],
    ["A", "I", "I", "I", "J", "J", "I", "K", "I", "J", "J"],
    ["J", "I", "G", "I", "I", "I", "I", "H", "I", "I", "I"],
    ["J", "I", "I", "F", "K", "J", "J", "J", "K", "K", "I"],
    ["H", "J", "I", "J", "K", "K", "G", "J", "K", "I", "I"],
    ["I", "I", "I", "J", "D", "K", "K", "J", "C", "I", "K"],
    ["I", "J", "J", "E", "K", "I", "I", "I", "J", "I", "I"],
    ["I", "I", "I", "I", "K", "I", "F", "I", "J", "E", "I"],
    ["K", "K", "K", "I", "I", "I", "J", "I", "I", "J", "D"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: lightOrchid,
    E: atomicTangerine,
    F: bittersweet,
    G: saharaSand,
    H: celadon,
    I: lightGreen,
    J: periwinkle,
    K: altoMain,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
