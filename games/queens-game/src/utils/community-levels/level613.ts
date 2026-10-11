import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/613",
  size: 6,
  colorRegions: [
    ["D", "E", "F", "F", "E", "C"],
    ["D", "E", "B", "B", "E", "C"],
    ["D", "E", "B", "B", "E", "C"],
    ["D", "E", "E", "E", "E", "C"],
    ["D", "A", "E", "E", "A", "A"],
    ["D", "A", "E", "E", "A", "A"],
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
  createdBy: "CC",
  creatorLink: "https://github.com/CayCelis",
};

export default level;
