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
  path: "/community-level/708",
  size: 7,
  colorRegions: [
    ["A", "B", "B", "B", "D", "B", "C"],
    ["E", "G", "G", "D", "D", "D", "F"],
    ["A", "G", "A", "A", "D", "D", "C"],
    ["A", "C", "C", "E", "A", "G", "A"],
    ["A", "B", "A", "E", "E", "G", "E"],
    ["A", "D", "A", "A", "A", "G", "E"],
    ["D", "D", "B", "B", "B", "A", "A"],
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
  createdBy: "Kiran's Sunshine",
  creatorLink: "",
};

export default level;
