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
  path: "/community-level/731",
  size: 11,
  colorRegions: [
    ["D", "D", "A", "F", "A", "I", "A", "E", "E", "A", "C"],
    ["D", "A", "F", "A", "A", "I", "I", "A", "A", "E", "A"],
    ["A", "F", "A", "A", "K", "A", "I", "I", "A", "A", "E"],
    ["F", "A", "A", "K", "K", "K", "A", "I", "I", "A", "E"],
    ["A", "A", "K", "J", "J", "J", "K", "A", "I", "I", "A"],
    ["A", "K", "J", "J", "A", "J", "K", "K", "A", "G", "G"],
    ["K", "J", "J", "A", "J", "J", "K", "A", "G", "G", "A"],
    ["H", "H", "A", "J", "J", "K", "A", "G", "G", "A", "A"],
    ["A", "H", "H", "A", "J", "A", "G", "G", "A", "A", "B"],
    ["C", "A", "H", "H", "A", "G", "G", "A", "A", "B", "A"],
    ["C", "C", "A", "H", "G", "G", "A", "A", "B", "A", "D"],
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
