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
  path: "/community-level/591",
  size: 7,
  colorRegions: [
    ["E", "C", "G", "F", "F", "D", "G"],
    ["C", "C", "C", "F", "G", "D", "D"],
    ["G", "G", "G", "G", "G", "G", "G"],
    ["E", "A", "E", "G", "G", "G", "G"],
    ["F", "G", "G", "G", "G", "G", "E"],
    ["F", "A", "E", "E", "C", "B", "E"],
    ["A", "A", "A", "A", "B", "B", "E"],
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
  createdBy: "gdeniz",
  creatorLink: "https://github.com/gdenizbilgin",
};

export default level;
