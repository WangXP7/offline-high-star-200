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
  path: "/community-level/611",
  size: 8,
  colorRegions: [
    ["D", "D", "A", "A", "G", "E", "E", "E"],
    ["D", "H", "H", "A", "H", "H", "H", "G"],
    ["E", "H", "H", "A", "H", "H", "H", "E"],
    ["F", "B", "A", "A", "A", "B", "F", "F"],
    ["F", "H", "H", "C", "H", "H", "H", "F"],
    ["C", "H", "H", "C", "H", "H", "H", "C"],
    ["D", "H", "H", "B", "B", "B", "H", "G"],
    ["F", "F", "B", "B", "C", "C", "C", "C"],
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
  createdBy: "Jess",
  creatorLink: "",
};

export default level;
