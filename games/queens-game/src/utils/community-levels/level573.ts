import {
  altoMain,
  anakiwa,
  celadon,
  chardonnay,
  lightWisteria,
  white,
} from "../colors";

const level = {
  path: "/community-level/573",
  size: 6,
  colorRegions: [
    ["E", "D", "A", "B", "C", "A"],
    ["D", "E", "A", "A", "A", "A"],
    ["D", "D", "F", "F", "F", "F"],
    ["A", "B", "B", "B", "B", "B"],
    ["D", "D", "E", "E", "E", "C"],
    ["B", "D", "E", "B", "E", "C"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: white,
  },
  solutionsCount: 1,
  createdBy: "isv11",
  creatorLink: "https://github.com/ismael-sierra",
};

export default level;
