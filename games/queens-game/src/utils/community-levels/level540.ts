import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/540",
  size: 8,
  colorRegions: [
    ["A", "H", "B", "H", "H", "H", "H", "H"],
    ["A", "A", "B", "H", "H", "H", "H", "H"],
    ["H", "H", "B", "B", "C", "H", "H", "H"],
    ["H", "H", "H", "H", "F", "C", "C", "H"],
    ["E", "H", "F", "F", "F", "D", "D", "D"],
    ["E", "E", "E", "H", "F", "G", "G", "H"],
    ["H", "H", "E", "H", "F", "H", "G", "G"],
    ["H", "H", "H", "H", "F", "F", "H", "H"],
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
  },
  solutionsCount: 1,
  createdBy: "Stridon",
  creatorLink: "",
};

export default level;
