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
  path: "/community-level/581",
  size: 7,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A"],
    ["D", "D", "D", "E", "G", "A", "A"],
    ["D", "C", "D", "E", "G", "G", "A"],
    ["D", "C", "C", "E", "E", "G", "A"],
    ["D", "B", "C", "C", "E", "G", "G"],
    ["D", "B", "C", "D", "E", "F", "G"],
    ["D", "D", "D", "D", "E", "F", "F"],
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
  createdBy: "andreastramondo",
  creatorLink: "",
};

export default level;
