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
  path: "/community-level/546",
  size: 7,
  colorRegions: [
    ["F", "F", "D", "D", "B", "B", "A"],
    ["F", "F", "D", "C", "B", "B", "A"],
    ["F", "F", "D", "C", "B", "A", "A"],
    ["F", "E", "D", "C", "B", "A", "A"],
    ["G", "E", "D", "C", "B", "A", "A"],
    ["G", "E", "C", "C", "C", "A", "A"],
    ["G", "E", "E", "E", "C", "A", "A"],
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
  createdBy: "Oxoa",
  creatorLink: "",
};

export default level;
