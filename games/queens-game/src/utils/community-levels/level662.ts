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
  path: "/community-level/662",
  size: 7,
  colorRegions: [
    ["E", "A", "G", "D", "D", "D", "A"],
    ["E", "E", "A", "D", "D", "D", "A"],
    ["E", "D", "D", "D", "D", "G", "A"],
    ["F", "D", "D", "G", "A", "B", "A"],
    ["F", "D", "B", "A", "B", "B", "A"],
    ["F", "D", "F", "B", "B", "C", "A"],
    ["F", "D", "B", "B", "E", "C", "E"],
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
  createdBy: "Sakura",
  creatorLink: "",
};

export default level;
