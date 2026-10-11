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
  path: "/community-level/559",
  size: 7,
  colorRegions: [
    ["B", "B", "B", "B", "B", "B", "B"],
    ["F", "E", "E", "A", "C", "C", "B"],
    ["F", "E", "A", "A", "A", "C", "B"],
    ["F", "G", "G", "A", "D", "D", "B"],
    ["F", "G", "G", "D", "D", "B", "B"],
    ["F", "G", "D", "D", "D", "B", "B"],
    ["F", "F", "F", "D", "B", "B", "B"],
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
  createdBy: "Bates",
  creatorLink: "",
};

export default level;
