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
  path: "/community-level/482",
  size: 7,
  colorRegions: [
    ["C", "F", "G", "G", "G", "E", "A"],
    ["C", "F", "F", "G", "E", "A", "A"],
    ["C", "F", "G", "G", "E", "E", "E"],
    ["C", "D", "D", "D", "E", "E", "C"],
    ["C", "D", "B", "B", "E", "E", "C"],
    ["C", "D", "D", "B", "E", "C", "C"],
    ["C", "C", "B", "B", "C", "C", "C"],
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
  createdBy: "Mgall",
  creatorLink: "",
};

export default level;
