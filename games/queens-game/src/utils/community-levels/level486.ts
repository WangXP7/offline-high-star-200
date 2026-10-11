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
  path: "/community-level/486",
  size: 7,
  colorRegions: [
    ["C", "A", "B", "C", "B", "B", "G"],
    ["E", "A", "C", "B", "C", "B", "G"],
    ["E", "A", "D", "F", "F", "F", "G"],
    ["D", "F", "F", "F", "G", "G", "G"],
    ["D", "F", "A", "A", "A", "D", "B"],
    ["D", "D", "D", "D", "D", "D", "G"],
    ["D", "A", "D", "D", "D", "D", "G"],
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
  createdBy: "The Riddler",
  creatorLink: "",
};

export default level;
