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
  turquoiseBlue,
} from "../colors";

const level = {
  path: "/community-level/707",
  size: 11,
  colorRegions: [
    ["G", "K", "K", "K", "G", "A", "G", "E", "E", "H", "H"],
    ["G", "A", "K", "G", "A", "A", "A", "G", "E", "G", "G"],
    ["H", "A", "A", "A", "C", "C", "C", "A", "A", "A", "A"],
    ["H", "A", "A", "C", "B", "B", "B", "C", "A", "A", "H"],
    ["H", "A", "C", "G", "G", "F", "G", "G", "C", "A", "H"],
    ["H", "H", "C", "G", "F", "F", "F", "G", "C", "H", "H"],
    ["H", "A", "C", "G", "G", "F", "D", "G", "C", "A", "H"],
    ["H", "A", "A", "C", "D", "D", "D", "C", "A", "A", "H"],
    ["A", "A", "A", "A", "C", "C", "C", "A", "A", "A", "G"],
    ["G", "G", "J", "G", "A", "A", "A", "G", "I", "A", "G"],
    ["H", "H", "J", "J", "G", "A", "G", "I", "I", "I", "G"],
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
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "VictorBandoiu",
  creatorLink: "https://www.instagram.com/victorban72/",
};

export default level;
