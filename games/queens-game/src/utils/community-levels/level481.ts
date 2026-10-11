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
  path: "/community-level/481",
  size: 7,
  colorRegions: [
    ["C", "E", "E", "E", "E", "E", "E"],
    ["A", "A", "F", "F", "E", "F", "E"],
    ["A", "A", "A", "F", "F", "F", "E"],
    ["A", "B", "A", "D", "F", "E", "E"],
    ["B", "B", "B", "D", "F", "G", "E"],
    ["B", "D", "D", "D", "D", "G", "E"],
    ["G", "G", "G", "G", "G", "G", "E"],
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
  createdBy: "kokohead",
  creatorLink: "",
};

export default level;
