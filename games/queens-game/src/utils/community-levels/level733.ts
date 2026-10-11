import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  halfBaked,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/733",
  size: 10,
  colorRegions: [
    ["A", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
    ["H", "A", "G", "G", "H", "G", "D", "D", "D", "H"],
    ["H", "G", "A", "G", "A", "G", "G", "B", "D", "H"],
    ["H", "G", "G", "A", "A", "G", "B", "B", "D", "H"],
    ["H", "G", "A", "A", "A", "G", "G", "G", "H", "H"],
    ["H", "G", "G", "G", "G", "C", "C", "C", "G", "H"],
    ["J", "G", "G", "F", "G", "C", "C", "G", "G", "H"],
    ["J", "E", "G", "F", "I", "C", "G", "C", "G", "H"],
    ["J", "E", "E", "G", "G", "I", "G", "G", "C", "H"],
    ["J", "J", "H", "J", "J", "J", "J", "J", "J", "C"],
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
    I: lightOrchid,
    J: halfBaked,
  },
  solutionsCount: 1,
  createdBy: "VictorBandoiu",
  creatorLink: "https://www.instagram.com/victorban72/",
};

export default level;
