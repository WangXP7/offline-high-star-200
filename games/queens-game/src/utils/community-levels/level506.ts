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
  path: "/community-level/506",
  size: 7,
  colorRegions: [
    ["C", "C", "A", "A", "A", "A", "A"],
    ["A", "C", "C", "C", "C", "C", "F"],
    ["A", "C", "G", "E", "E", "C", "F"],
    ["A", "C", "G", "E", "D", "D", "F"],
    ["A", "C", "G", "G", "D", "F", "F"],
    ["C", "C", "C", "G", "D", "F", "B"],
    ["B", "B", "B", "G", "B", "B", "B"],
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
  createdBy: "Dougoume",
  creatorLink: "",
};

export default level;
