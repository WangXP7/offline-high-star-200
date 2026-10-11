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
  path: "/community-level/677",
  size: 8,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A"],
    ["A", "G", "G", "G", "G", "G", "G", "H"],
    ["A", "G", "F", "B", "B", "C", "C", "H"],
    ["A", "G", "F", "B", "B", "C", "E", "H"],
    ["A", "G", "D", "B", "E", "E", "E", "H"],
    ["A", "G", "E", "E", "E", "E", "D", "H"],
    ["A", "G", "E", "E", "E", "D", "H", "H"],
    ["A", "G", "D", "D", "D", "F", "B", "H"],
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
  createdBy: "ArchieTheBest",
  creatorLink: "",
};

export default level;
