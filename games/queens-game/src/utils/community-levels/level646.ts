import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/646",
  size: 7,
  colorRegions: [
    ["A", "A", "B", "G", "E", "G", "B"],
    ["G", "G", "G", "E", "G", "G", "G"],
    ["A", "G", "G", "G", "G", "G", "B"],
    ["D", "G", "G", "G", "F", "A", "E"],
    ["E", "G", "G", "G", "A", "F", "C"],
    ["G", "G", "G", "G", "G", "G", "E"],
    ["D", "G", "D", "G", "C", "G", "C"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
  },
  solutionsCount: 1,
  createdBy: "pasiaj",
  creatorLink: "",
};

export default level;
