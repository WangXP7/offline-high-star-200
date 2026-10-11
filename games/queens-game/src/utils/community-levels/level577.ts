import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/577",
  size: 7,
  colorRegions: [
    ["F", "F", "C", "C", "C", "A", "A"],
    ["F", "F", "C", "E", "E", "B", "A"],
    ["F", "F", "E", "E", "E", "B", "A"],
    ["F", "F", "E", "E", "D", "D", "D"],
    ["F", "F", "G", "E", "E", "D", "D"],
    ["F", "G", "G", "G", "E", "D", "D"],
    ["G", "G", "G", "G", "D", "D", "D"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
  },
  solutionsCount: 1,
  createdBy: "Dicker Jockel",
  creatorLink: "",
};

export default level;
