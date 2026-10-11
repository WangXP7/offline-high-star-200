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
  path: "/community-level/730",
  size: 11,
  colorRegions: [
    ["A", "B", "B", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "A"],
    ["B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "A"],
    ["A", "C", "D", "D", "E", "E", "F", "F", "G", "G", "A"],
    ["A", "D", "D", "E", "E", "F", "F", "G", "G", "H", "A"],
    ["A", "D", "E", "E", "F", "F", "G", "G", "H", "H", "A"],
    ["A", "E", "E", "F", "F", "G", "G", "H", "H", "I", "A"],
    ["A", "E", "F", "F", "G", "G", "H", "H", "I", "I", "A"],
    ["A", "F", "F", "G", "G", "H", "H", "I", "I", "J", "A"],
    ["A", "F", "G", "G", "H", "H", "I", "I", "J", "J", "A"],
    ["A", "A", "A", "A", "A", "A", "A", "A", "K", "K", "A"],
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
