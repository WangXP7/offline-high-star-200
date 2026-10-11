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
  path: "/community-level/614",
  size: 7,
  colorRegions: [
    ["F", "F", "G", "G", "D", "D", "A"],
    ["F", "G", "G", "A", "D", "D", "D"],
    ["F", "G", "A", "A", "A", "A", "A"],
    ["F", "A", "C", "A", "E", "A", "A"],
    ["F", "A", "C", "A", "A", "A", "A"],
    ["F", "A", "A", "A", "A", "A", "A"],
    ["F", "F", "A", "A", "A", "A", "B"],
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
  createdBy: "Apple",
  creatorLink: "",
};

export default level;
