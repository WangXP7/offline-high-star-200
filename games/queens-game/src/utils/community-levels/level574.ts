import {
  altoMain,
  anakiwa,
  atomicTangerine,
  bittersweet,
  celadon,
  nomad,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/574",
  size: 8,
  colorRegions: [
    ["C", "C", "C", "C", "C", "C", "C", "G"],
    ["C", "C", "D", "D", "C", "C", "C", "C"],
    ["E", "D", "D", "D", "D", "E", "F", "E"],
    ["E", "D", "D", "D", "D", "E", "F", "E"],
    ["E", "E", "D", "D", "E", "F", "F", "F"],
    ["H", "E", "D", "E", "E", "E", "F", "E"],
    ["H", "H", "D", "A", "A", "A", "A", "A"],
    ["B", "B", "A", "A", "A", "A", "A", "A"],
  ],
  regionColors: {
    A: nomad,
    B: altoMain,
    C: anakiwa,
    D: celadon,
    E: white,
    F: bittersweet,
    G: saharaSand,
    H: atomicTangerine,
  },
  solutionsCount: 1,
  createdBy: "chonkyalien",
  creatorLink: "",
};

export default level;
