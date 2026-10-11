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
  path: "/community-level/724",
  size: 8,
  colorRegions: [
    ["A", "D", "F", "F", "B", "B", "B", "B"],
    ["A", "D", "B", "F", "B", "G", "B", "B"],
    ["A", "D", "B", "B", "B", "G", "G", "G"],
    ["A", "D", "H", "H", "H", "H", "H", "H"],
    ["A", "D", "H", "C", "H", "C", "H", "H"],
    ["D", "D", "H", "C", "H", "C", "H", "H"],
    ["D", "D", "D", "C", "H", "C", "C", "C"],
    ["D", "D", "D", "C", "C", "C", "C", "E"],
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
  createdBy: "Alexa C",
  creatorLink: "",
};

export default level;
