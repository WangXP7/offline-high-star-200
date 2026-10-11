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
  path: "/community-level/510",
  size: 7,
  colorRegions: [
    ["G", "G", "G", "G", "G", "F", "F"],
    ["F", "D", "D", "E", "E", "F", "F"],
    ["D", "D", "E", "E", "F", "F", "F"],
    ["C", "C", "C", "C", "C", "C", "C"],
    ["C", "C", "C", "C", "C", "C", "B"],
    ["F", "G", "G", "A", "A", "B", "B"],
    ["G", "G", "A", "A", "B", "B", "B"],
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
  createdBy: "NewBee",
  creatorLink: "",
};

export default level;
