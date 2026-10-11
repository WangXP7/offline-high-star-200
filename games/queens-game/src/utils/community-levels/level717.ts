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
  path: "/community-level/717",
  size: 11,
  colorRegions: [
    ["D", "D", "D", "A", "A", "A", "A", "A", "D", "D", "D"],
    ["F", "F", "B", "F", "A", "F", "F", "A", "F", "E", "D"],
    ["A", "C", "A", "B", "G", "G", "G", "G", "E", "F", "A"],
    ["A", "E", "C", "A", "B", "K", "K", "E", "G", "F", "A"],
    ["A", "A", "H", "C", "A", "B", "E", "E", "A", "F", "A"],
    ["A", "E", "H", "J", "C", "A", "B", "E", "G", "F", "A"],
    ["A", "E", "H", "J", "E", "C", "A", "B", "A", "F", "A"],
    ["A", "E", "H", "E", "I", "I", "C", "A", "B", "F", "A"],
    ["A", "E", "E", "H", "H", "H", "H", "C", "A", "B", "D"],
    ["A", "E", "E", "E", "E", "E", "E", "A", "C", "F", "D"],
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "F", "D"],
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
