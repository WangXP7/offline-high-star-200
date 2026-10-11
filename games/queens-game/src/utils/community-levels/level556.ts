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
  path: "/community-level/556",
  size: 7,
  colorRegions: [
    ["D", "G", "G", "G", "G", "G", "G"],
    ["D", "D", "D", "D", "G", "G", "G"],
    ["C", "G", "F", "D", "G", "G", "G"],
    ["G", "B", "B", "D", "A", "A", "E"],
    ["C", "A", "G", "B", "B", "B", "G"],
    ["C", "C", "B", "B", "F", "E", "G"],
    ["C", "B", "B", "C", "G", "G", "G"],
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
  createdBy: "Seishinkai",
  creatorLink: "",
};

export default level;
