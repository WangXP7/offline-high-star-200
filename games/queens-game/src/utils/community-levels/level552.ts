import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/552",
  size: 6,
  colorRegions: [
    ["D", "D", "D", "C", "C", "C"],
    ["D", "D", "D", "E", "E", "C"],
    ["D", "F", "D", "C", "E", "C"],
    ["B", "E", "B", "A", "E", "A"],
    ["B", "E", "E", "E", "E", "A"],
    ["B", "B", "B", "A", "A", "A"],
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
  createdBy: "Grass",
  creatorLink: "",
};

export default level;
