import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/669",
  size: 9,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["C", "D", "D", "D", "D", "D", "D", "A", "A"],
    ["C", "C", "E", "E", "E", "G", "G", "G", "G"],
    ["C", "C", "F", "B", "B", "B", "B", "B", "G"],
    ["C", "C", "F", "B", "B", "B", "B", "B", "G"],
    ["F", "F", "F", "B", "H", "H", "H", "H", "H"],
    ["F", "I", "I", "I", "H", "I", "I", "I", "I"],
    ["I", "I", "I", "I", "H", "I", "I", "I", "I"],
    ["I", "I", "I", "I", "I", "I", "I", "I", "I"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
    I: lightOrchid,
  },
  solutionsCount: 1,
  createdBy: "Kernel",
  creatorLink: "",
};

export default level;
