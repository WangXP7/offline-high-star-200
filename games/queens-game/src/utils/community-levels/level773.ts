import {
  altoMain,
  anakiwa,
  atomicTangerine,
  bittersweet,
  chardonnay,
  lavenderRose,
  lightGreen,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/773",
  size: 9,
  colorRegions: [
    ["I", "G", "G", "G", "G", "G", "G", "I", "I"],
    ["I", "G", "G", "C", "C", "C", "G", "G", "I"],
    ["D", "D", "D", "D", "D", "F", "F", "F", "F"],
    ["I", "I", "D", "H", "H", "F", "I", "I", "I"],
    ["I", "I", "D", "H", "E", "F", "F", "F", "I"],
    ["D", "I", "D", "E", "H", "F", "I", "I", "I"],
    ["D", "D", "D", "B", "B", "F", "F", "F", "F"],
    ["I", "A", "B", "B", "B", "A", "A", "A", "I"],
    ["I", "A", "A", "A", "A", "A", "I", "A", "I"],
  ],
  regionColors: {
    A: lavenderRose,
    B: chardonnay,
    C: lightGreen,
    D: anakiwa,
    E: white,
    F: bittersweet,
    G: atomicTangerine,
    H: altoMain,
    I: saharaSand,
  },
  solutionsCount: 1,
  createdBy: "Eps",
  creatorLink: "",
};

export default level;
