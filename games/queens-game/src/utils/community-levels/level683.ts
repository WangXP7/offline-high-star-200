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
  path: "/community-level/683",
  size: 7,
  colorRegions: [
    ["E", "E", "E", "E", "E", "E", "E"],
    ["E", "G", "G", "G", "G", "G", "E"],
    ["A", "A", "A", "B", "B", "G", "E"],
    ["A", "A", "B", "B", "D", "G", "E"],
    ["C", "C", "C", "D", "D", "G", "E"],
    ["F", "D", "D", "D", "G", "G", "E"],
    ["F", "F", "F", "F", "F", "F", "E"],
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
  createdBy: "arthurv",
  creatorLink: "",
};

export default level;
