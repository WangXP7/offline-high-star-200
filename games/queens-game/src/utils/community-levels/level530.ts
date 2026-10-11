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
  path: "/community-level/530",
  size: 7,
  colorRegions: [
    ["A", "F", "F", "A", "A", "A", "A"],
    ["F", "F", "F", "A", "A", "A", "A"],
    ["F", "G", "G", "F", "A", "B", "A"],
    ["F", "F", "F", "F", "B", "B", "A"],
    ["D", "D", "D", "D", "C", "B", "A"],
    ["D", "E", "E", "D", "C", "B", "A"],
    ["D", "E", "E", "D", "C", "C", "A"],
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
  createdBy: "PetR",
  creatorLink: "",
};

export default level;
