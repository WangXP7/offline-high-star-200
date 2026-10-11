import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/691",
  size: 6,
  colorRegions: [
    ["D", "E", "A", "F", "E", "D"],
    ["F", "A", "C", "A", "D", "E"],
    ["E", "F", "F", "A", "C", "E"],
    ["D", "E", "C", "A", "D", "E"],
    ["F", "E", "E", "D", "E", "E"],
    ["C", "A", "B", "B", "E", "D"],
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
  createdBy: "workingshaw",
  creatorLink: "https://github.com/workingshaw",
};

export default level;
