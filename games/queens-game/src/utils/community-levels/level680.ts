import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/680",
  size: 6,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A"],
    ["B", "A", "B", "A", "C", "A"],
    ["B", "F", "B", "A", "C", "A"],
    ["D", "D", "D", "E", "F", "A"],
    ["D", "E", "E", "E", "F", "D"],
    ["D", "E", "F", "F", "F", "D"],
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
  createdBy: "Okamille",
  creatorLink: "https://github.com/Okamille",
};

export default level;
