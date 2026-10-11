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
  path: "/community-level/517",
  size: 7,
  colorRegions: [
    ["G", "F", "E", "D", "C", "B", "A"],
    ["F", "F", "D", "D", "C", "F", "G"],
    ["F", "E", "E", "C", "C", "B", "G"],
    ["F", "F", "D", "D", "B", "B", "A"],
    ["F", "E", "D", "D", "C", "A", "B"],
    ["F", "E", "D", "C", "B", "B", "B"],
    ["F", "E", "E", "C", "B", "A", "A"],
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
  createdBy: "Ray",
  creatorLink: "",
};

export default level;
