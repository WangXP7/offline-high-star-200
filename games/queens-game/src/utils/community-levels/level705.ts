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
  path: "/community-level/705",
  size: 11,
  colorRegions: [
    ["E", "E", "E", "F", "F", "F", "F", "F", "F", "K", "K"],
    ["E", "F", "F", "F", "F", "A", "A", "A", "A", "A", "K"],
    ["E", "F", "F", "D", "D", "D", "D", "A", "A", "A", "K"],
    ["I", "D", "D", "D", "D", "D", "A", "A", "C", "A", "K"],
    ["I", "B", "D", "G", "D", "A", "A", "H", "C", "A", "C"],
    ["I", "B", "B", "B", "A", "A", "H", "H", "C", "C", "C"],
    ["I", "B", "B", "A", "A", "H", "H", "H", "H", "C", "C"],
    ["I", "I", "A", "A", "H", "H", "H", "H", "H", "C", "C"],
    ["I", "A", "A", "J", "H", "H", "H", "H", "H", "H", "C"],
    ["I", "A", "J", "J", "J", "H", "H", "H", "H", "H", "C"],
    ["A", "A", "I", "I", "J", "H", "H", "H", "H", "H", "C"],
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
