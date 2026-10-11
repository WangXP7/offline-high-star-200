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
  path: "/community-level/561",
  size: 7,
  colorRegions: [
    ["B", "A", "B", "B", "B", "B", "B"],
    ["A", "A", "B", "B", "B", "B", "C"],
    ["D", "D", "D", "D", "F", "F", "F"],
    ["E", "E", "D", "G", "F", "F", "F"],
    ["E", "D", "D", "G", "G", "G", "F"],
    ["D", "E", "E", "G", "G", "A", "F"],
    ["D", "E", "E", "F", "F", "F", "F"],
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
  createdBy: "justi",
  creatorLink: "",
};

export default level;
