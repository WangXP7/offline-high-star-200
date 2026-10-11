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
  path: "/community-level/572",
  size: 7,
  colorRegions: [
    ["C", "C", "B", "B", "B", "B", "B"],
    ["C", "C", "D", "D", "D", "D", "D"],
    ["C", "A", "A", "D", "E", "E", "E"],
    ["C", "D", "D", "D", "E", "E", "E"],
    ["G", "G", "G", "G", "F", "E", "F"],
    ["G", "G", "G", "G", "F", "F", "F"],
    ["G", "G", "G", "G", "F", "F", "F"],
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
  createdBy: "lf_d",
  creatorLink: "",
};

export default level;
