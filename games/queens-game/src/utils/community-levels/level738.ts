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
  path: "/community-level/738",
  size: 8,
  colorRegions: [
    ["C", "E", "A", "F", "D", "B", "E", "H"],
    ["C", "E", "A", "F", "D", "B", "E", "H"],
    ["A", "A", "A", "B", "B", "B", "B", "B"],
    ["D", "G", "B", "C", "H", "B", "D", "G"],
    ["D", "G", "B", "C", "H", "B", "D", "G"],
    ["B", "B", "B", "B", "B", "B", "A", "A"],
    ["H", "F", "B", "E", "G", "A", "F", "C"],
    ["H", "F", "B", "E", "G", "A", "F", "C"],
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
  createdBy: "Baert",
  creatorLink: "https://github.com/ElBartoUno",
};

export default level;
