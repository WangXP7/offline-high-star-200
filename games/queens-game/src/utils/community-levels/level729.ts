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
  path: "/community-level/729",
  size: 7,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A"],
    ["A", "D", "G", "G", "F", "B", "G"],
    ["A", "D", "D", "F", "F", "B", "G"],
    ["A", "G", "G", "C", "C", "B", "G"],
    ["A", "E", "E", "C", "C", "B", "G"],
    ["A", "E", "A", "G", "G", "B", "E"],
    ["A", "B", "B", "B", "B", "B", "E"],
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
  createdBy: "Anthony",
  creatorLink: "",
};

export default level;
