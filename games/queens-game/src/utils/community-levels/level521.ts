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
  path: "/community-level/521",
  size: 7,
  colorRegions: [
    ["C", "C", "C", "C", "C", "B", "A"],
    ["E", "F", "C", "C", "B", "B", "A"],
    ["E", "F", "C", "B", "B", "A", "A"],
    ["E", "E", "C", "C", "G", "G", "G"],
    ["E", "E", "E", "E", "E", "G", "G"],
    ["E", "D", "D", "E", "E", "E", "G"],
    ["E", "E", "E", "E", "E", "E", "E"],
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
  createdBy: "Selden",
  creatorLink: "",
};

export default level;
