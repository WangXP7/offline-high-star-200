import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/771",
  size: 6,
  colorRegions: [
    ["F", "F", "F", "F", "F", "B"],
    ["C", "C", "A", "A", "A", "B"],
    ["F", "F", "A", "B", "B", "B"],
    ["F", "C", "C", "C", "C", "E"],
    ["F", "C", "D", "D", "C", "E"],
    ["F", "C", "D", "E", "E", "E"],
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
  createdBy: "Kaig",
  creatorLink: "https://github.com/kai56588",
};

export default level;
