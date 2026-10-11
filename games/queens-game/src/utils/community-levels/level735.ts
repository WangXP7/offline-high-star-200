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
  path: "/community-level/735",
  size: 8,
  colorRegions: [
    ["D", "D", "G", "B", "H", "G", "G", "A"],
    ["D", "H", "G", "D", "H", "G", "A", "A"],
    ["G", "G", "G", "H", "H", "G", "G", "A"],
    ["C", "C", "G", "E", "C", "A", "E", "H"],
    ["F", "F", "F", "E", "E", "D", "E", "E"],
    ["D", "D", "G", "D", "H", "G", "A", "C"],
    ["D", "G", "H", "B", "B", "D", "C", "F"],
    ["H", "H", "H", "D", "D", "D", "C", "F"],
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
  createdBy: "VictorBandoiu",
  creatorLink: "https://www.instagram.com/victorban72/",
};

export default level;
