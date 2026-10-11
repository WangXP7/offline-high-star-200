import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/652",
  size: 6,
  colorRegions: [
    ["B", "B", "B", "B", "C", "C"],
    ["B", "D", "A", "C", "C", "E"],
    ["B", "B", "A", "A", "C", "E"],
    ["A", "A", "A", "F", "F", "D"],
    ["A", "A", "F", "F", "F", "D"],
    ["E", "A", "F", "F", "F", "D"],
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
  createdBy: "Baert",
  creatorLink: "https://github.com/ElBartoUno",
};

export default level;
