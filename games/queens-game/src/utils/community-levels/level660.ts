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
  path: "/community-level/660",
  size: 7,
  colorRegions: [
    ["D", "D", "D", "D", "D", "D", "D"],
    ["B", "B", "G", "F", "F", "F", "D"],
    ["B", "B", "G", "F", "F", "E", "D"],
    ["B", "B", "G", "G", "G", "E", "D"],
    ["B", "B", "A", "A", "G", "E", "D"],
    ["B", "A", "A", "D", "C", "C", "D"],
    ["A", "A", "A", "D", "D", "D", "D"],
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
  createdBy: "kiki",
  creatorLink: "",
};

export default level;
