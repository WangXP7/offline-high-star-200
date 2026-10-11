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
  path: "/community-level/488",
  size: 7,
  colorRegions: [
    ["E", "G", "F", "G", "E", "A", "B"],
    ["G", "D", "D", "D", "A", "C", "B"],
    ["F", "E", "F", "A", "B", "C", "B"],
    ["B", "B", "A", "F", "B", "B", "B"],
    ["C", "A", "E", "G", "C", "B", "B"],
    ["A", "B", "B", "D", "C", "B", "B"],
    ["C", "C", "C", "D", "D", "D", "B"],
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
  createdBy: "dumbdeedah",
  creatorLink: "",
};

export default level;
