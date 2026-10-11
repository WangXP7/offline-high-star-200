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
  path: "/community-level/588",
  size: 7,
  colorRegions: [
    ["A", "D", "D", "D", "D", "C", "C"],
    ["A", "A", "A", "D", "D", "D", "C"],
    ["B", "B", "D", "D", "G", "D", "D"],
    ["E", "B", "B", "G", "G", "G", "G"],
    ["E", "F", "F", "F", "G", "G", "F"],
    ["E", "E", "F", "F", "F", "G", "F"],
    ["E", "E", "E", "E", "F", "F", "F"],
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
  createdBy: "Jensar",
  creatorLink: "",
};

export default level;
