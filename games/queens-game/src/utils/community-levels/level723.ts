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
  path: "/community-level/723",
  size: 10,
  colorRegions: [
    ["A", "J", "J", "J", "J", "J", "J", "J", "J", "A"],
    ["A", "B", "J", "J", "J", "J", "J", "J", "B", "A"],
    ["J", "B", "C", "J", "J", "J", "J", "C", "B", "J"],
    ["J", "J", "C", "D", "J", "J", "D", "C", "J", "J"],
    ["J", "J", "J", "D", "E", "E", "D", "J", "J", "J"],
    ["J", "J", "J", "F", "E", "E", "F", "J", "J", "J"],
    ["J", "J", "G", "F", "J", "J", "F", "G", "J", "J"],
    ["J", "H", "G", "J", "J", "J", "J", "G", "H", "J"],
    ["I", "H", "J", "J", "J", "H", "J", "J", "H", "I"],
    ["J", "J", "J", "J", "J", "J", "J", "J", "J", "I"],
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
