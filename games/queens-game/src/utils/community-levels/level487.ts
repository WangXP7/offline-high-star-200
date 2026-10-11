import {
  altoMain,
  bittersweet,
  lavenderRose,
  lightOrchid,
  lightWisteria,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/487",
  size: 6,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A"],
    ["A", "D", "D", "D", "D", "D"],
    ["A", "E", "F", "C", "C", "C"],
    ["A", "E", "F", "C", "B", "C"],
    ["A", "E", "F", "C", "C", "C"],
    ["A", "E", "F", "F", "F", "C"],
  ],
  regionColors: {
    A: altoMain,
    B: bittersweet,
    C: lightWisteria,
    D: lightOrchid,
    E: lavenderRose,
    F: saharaSand,
  },
  solutionsCount: 1,
  createdBy: "Julia Barreto",
  creatorLink: "",
};

export default level;
