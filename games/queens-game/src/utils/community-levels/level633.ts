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
  path: "/community-level/633",
  size: 7,
  colorRegions: [
    ["A", "A", "A", "G", "B", "G", "G"],
    ["A", "E", "A", "G", "B", "B", "B"],
    ["A", "A", "A", "G", "B", "F", "B"],
    ["C", "C", "A", "G", "B", "B", "B"],
    ["C", "G", "G", "D", "D", "D", "G"],
    ["C", "C", "G", "D", "G", "G", "D"],
    ["G", "G", "G", "D", "D", "D", "D"],
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
  createdBy: "Alfalfabet",
  creatorLink: "",
};

export default level;
