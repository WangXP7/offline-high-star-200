import {
  altoMain,
  anakiwa,
  atomicTangerine,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/538",
  size: 9,
  colorRegions: [
    ["F", "F", "F", "G", "G", "G", "G", "G", "G"],
    ["F", "D", "I", "I", "I", "I", "H", "G", "G"],
    ["D", "D", "I", "I", "I", "I", "H", "H", "G"],
    ["D", "D", "I", "I", "I", "I", "H", "I", "G"],
    ["D", "B", "I", "I", "I", "I", "I", "I", "G"],
    ["A", "B", "I", "I", "I", "I", "I", "I", "G"],
    ["A", "B", "I", "I", "I", "I", "I", "I", "E"],
    ["A", "B", "B", "B", "B", "B", "C", "E", "E"],
    ["A", "A", "A", "A", "A", "C", "C", "C", "E"],
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
    I: atomicTangerine,
  },
  solutionsCount: 1,
  createdBy: "fluke",
  creatorLink: "",
};

export default level;
