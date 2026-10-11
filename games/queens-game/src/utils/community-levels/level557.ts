import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/557",
  size: 8,
  colorRegions: [
    ["A", "A", "H", "H", "H", "H", "H", "D"],
    ["B", "A", "A", "H", "H", "H", "D", "D"],
    ["B", "H", "H", "H", "H", "H", "H", "D"],
    ["B", "B", "H", "H", "H", "H", "H", "E"],
    ["F", "F", "C", "C", "C", "C", "H", "E"],
    ["F", "F", "F", "H", "H", "C", "G", "E"],
    ["F", "F", "F", "G", "G", "G", "G", "H"],
    ["F", "H", "H", "H", "H", "H", "H", "H"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
  },
  solutionsCount: 1,
  createdBy: "Zohaib",
  creatorLink: "",
};

export default level;
