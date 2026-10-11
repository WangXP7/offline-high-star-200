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
  path: "/community-level/774",
  size: 7,
  colorRegions: [
    ["B", "B", "A", "A", "A", "C", "C"],
    ["B", "B", "A", "E", "A", "A", "C"],
    ["B", "B", "E", "E", "E", "A", "A"],
    ["D", "E", "E", "F", "E", "E", "E"],
    ["D", "D", "E", "E", "E", "D", "E"],
    ["G", "D", "D", "E", "D", "D", "D"],
    ["G", "G", "D", "D", "D", "D", "D"],
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
  createdBy: "gdex19",
  creatorLink: "",
};

export default level;
