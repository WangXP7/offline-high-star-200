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
  path: "/community-level/508",
  size: 8,
  colorRegions: [
    ["C", "C", "D", "D", "G", "G", "H", "F"],
    ["D", "D", "D", "D", "D", "G", "H", "F"],
    ["D", "D", "B", "D", "D", "G", "H", "F"],
    ["A", "D", "A", "D", "H", "G", "H", "F"],
    ["A", "A", "A", "D", "H", "G", "H", "H"],
    ["E", "A", "E", "D", "H", "G", "H", "H"],
    ["E", "E", "E", "D", "H", "H", "H", "H"],
    ["E", "E", "E", "E", "H", "H", "H", "H"],
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
  createdBy: "ItzToast",
  creatorLink: "",
};

export default level;
