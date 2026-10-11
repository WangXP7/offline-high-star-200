import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/575",
  size: 6,
  colorRegions: [
    ["A", "A", "A", "A", "C", "C"],
    ["A", "A", "D", "F", "F", "C"],
    ["D", "D", "D", "D", "F", "C"],
    ["A", "E", "D", "B", "F", "B"],
    ["A", "E", "E", "B", "B", "B"],
    ["A", "A", "E", "E", "E", "E"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
  },
  solutionsCount: 1,
  createdBy: "Maged",
  creatorLink: "",
};

export default level;
