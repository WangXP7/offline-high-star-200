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
  path: "/community-level/681",
  size: 7,
  colorRegions: [
    ["B", "A", "A", "A", "A", "A", "A"],
    ["A", "A", "G", "F", "G", "C", "G"],
    ["A", "A", "G", "G", "F", "G", "D"],
    ["A", "F", "C", "G", "C", "C", "D"],
    ["A", "F", "C", "D", "C", "C", "F"],
    ["A", "G", "F", "F", "E", "C", "C"],
    ["A", "F", "D", "G", "G", "F", "C"],
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
  createdBy: "lolo",
  creatorLink: "",
};

export default level;
