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
  path: "/community-level/578",
  size: 8,
  colorRegions: [
    ["F", "F", "A", "A", "A", "E", "E", "E"],
    ["F", "A", "A", "C", "A", "A", "A", "E"],
    ["A", "A", "C", "C", "D", "D", "A", "E"],
    ["A", "C", "C", "C", "C", "C", "A", "A"],
    ["A", "A", "B", "B", "C", "C", "C", "A"],
    ["G", "A", "B", "B", "B", "B", "A", "A"],
    ["G", "A", "A", "A", "B", "A", "A", "H"],
    ["G", "G", "G", "A", "A", "A", "H", "H"],
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
  createdBy: "Jess",
  creatorLink: "",
};

export default level;
