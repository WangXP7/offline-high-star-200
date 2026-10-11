import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/554",
  size: 6,
  colorRegions: [
    ["A", "A", "A", "B", "B", "F"],
    ["B", "B", "B", "B", "B", "F"],
    ["E", "E", "C", "C", "D", "F"],
    ["E", "E", "E", "D", "D", "F"],
    ["E", "E", "E", "D", "F", "F"],
    ["F", "F", "F", "F", "F", "F"],
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
  createdBy: "Anshik",
  creatorLink: "https://github.com/Anshik55",
};

export default level;
