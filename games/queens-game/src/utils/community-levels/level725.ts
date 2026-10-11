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
  path: "/community-level/725",
  size: 7,
  colorRegions: [
    ["B", "D", "D", "A", "C", "C", "C"],
    ["B", "D", "A", "A", "A", "C", "C"],
    ["B", "A", "A", "A", "A", "A", "C"],
    ["A", "A", "A", "A", "A", "A", "A"],
    ["F", "A", "A", "A", "A", "A", "F"],
    ["E", "F", "G", "F", "G", "F", "E"],
    ["F", "E", "F", "G", "F", "E", "F"],
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
  createdBy: "Crayon",
  creatorLink: "",
};

export default level;
