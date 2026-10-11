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
  path: "/community-level/632",
  size: 7,
  colorRegions: [
    ["G", "G", "G", "D", "A", "D", "A"],
    ["F", "F", "G", "D", "D", "D", "A"],
    ["F", "F", "E", "E", "D", "D", "A"],
    ["C", "C", "E", "E", "E", "D", "A"],
    ["B", "C", "B", "B", "B", "B", "A"],
    ["B", "C", "B", "A", "A", "A", "A"],
    ["B", "B", "B", "A", "A", "A", "A"],
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
  createdBy: "NAG",
  creatorLink: "",
};

export default level;
