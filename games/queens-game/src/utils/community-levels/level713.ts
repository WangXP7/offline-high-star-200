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
  path: "/community-level/713",
  size: 11,
  colorRegions: [
    ["A", "C", "C", "C", "C", "C", "C", "C", "C", "C", "A"],
    ["A", "G", "D", "I", "D", "D", "D", "D", "D", "G", "A"],
    ["A", "G", "A", "K", "K", "G", "K", "K", "A", "G", "A"],
    ["C", "G", "A", "B", "H", "G", "B", "H", "A", "G", "C"],
    ["C", "F", "A", "H", "C", "G", "C", "B", "A", "F", "C"],
    ["K", "G", "K", "B", "K", "G", "K", "H", "K", "G", "K"],
    ["C", "E", "K", "I", "C", "G", "C", "J", "K", "E", "C"],
    ["C", "J", "I", "J", "I", "G", "J", "I", "J", "I", "C"],
    ["C", "F", "K", "I", "K", "G", "K", "J", "K", "F", "C"],
    ["C", "D", "D", "D", "D", "D", "D", "D", "D", "D", "C"],
    ["C", "C", "C", "C", "C", "C", "C", "C", "C", "C", "K"],
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
