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
  path: "/community-level/697",
  size: 11,
  colorRegions: [
    ["I", "B", "B", "G", "J", "J", "H", "H", "A", "E", "D"],
    ["I", "H", "B", "G", "J", "K", "G", "H", "A", "E", "D"],
    ["I", "H", "H", "G", "J", "K", "G", "C", "A", "E", "D"],
    ["G", "G", "G", "G", "J", "K", "G", "C", "C", "C", "D"],
    ["G", "J", "J", "J", "J", "K", "G", "G", "G", "G", "G"],
    ["G", "K", "K", "K", "K", "K", "K", "K", "K", "K", "G"],
    ["G", "C", "C", "C", "C", "K", "G", "G", "G", "G", "G"],
    ["G", "G", "G", "G", "C", "K", "G", "C", "C", "C", "D"],
    ["J", "F", "F", "G", "C", "K", "G", "C", "E", "E", "D"],
    ["J", "A", "F", "G", "C", "K", "G", "J", "F", "E", "D"],
    ["A", "A", "A", "G", "C", "J", "J", "J", "F", "E", "D"],
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
