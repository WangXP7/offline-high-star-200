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
  path: "/community-level/494",
  size: 8,
  colorRegions: [
    ["C", "C", "H", "H", "G", "A", "A", "A"],
    ["C", "H", "H", "H", "G", "A", "A", "F"],
    ["H", "H", "G", "G", "G", "A", "E", "F"],
    ["H", "H", "G", "G", "D", "D", "E", "F"],
    ["G", "G", "G", "D", "D", "E", "E", "F"],
    ["B", "G", "D", "D", "D", "E", "F", "F"],
    ["B", "G", "G", "E", "E", "E", "F", "F"],
    ["G", "G", "G", "G", "E", "E", "F", "F"],
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
  createdBy: "CurryTrash",
  creatorLink: "",
};

export default level;
