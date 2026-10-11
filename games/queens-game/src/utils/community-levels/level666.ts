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
  path: "/community-level/666",
  size: 7,
  colorRegions: [
    ["A", "A", "G", "G", "D", "D", "C"],
    ["A", "A", "G", "D", "D", "D", "C"],
    ["F", "F", "G", "F", "F", "E", "C"],
    ["B", "B", "B", "F", "B", "E", "C"],
    ["F", "B", "B", "B", "B", "E", "C"],
    ["F", "B", "B", "C", "E", "E", "C"],
    ["C", "C", "C", "C", "C", "C", "C"],
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
  createdBy: "Arctic",
  creatorLink: "",
};

export default level;
