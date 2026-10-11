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
  path: "/community-level/693",
  size: 7,
  colorRegions: [
    ["B", "B", "F", "F", "C", "C", "F"],
    ["B", "F", "F", "F", "F", "C", "F"],
    ["F", "F", "E", "E", "E", "F", "F"],
    ["F", "F", "E", "E", "G", "F", "F"],
    ["F", "F", "E", "G", "G", "F", "F"],
    ["A", "F", "F", "F", "F", "F", "D"],
    ["A", "A", "F", "F", "F", "D", "D"],
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
  createdBy: "Mblnc",
  creatorLink: "",
};

export default level;
