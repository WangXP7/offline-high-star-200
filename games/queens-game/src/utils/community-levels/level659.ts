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
  path: "/community-level/659",
  size: 10,
  colorRegions: [
    ["A", "B", "B", "B", "B", "B", "B", "B", "B", "B"],
    ["C", "B", "B", "E", "E", "E", "E", "E", "E", "E"],
    ["C", "C", "E", "E", "E", "E", "I", "I", "I", "I"],
    ["C", "C", "D", "D", "D", "I", "I", "F", "F", "F"],
    ["C", "C", "D", "D", "J", "F", "F", "F", "F", "F"],
    ["F", "F", "F", "F", "F", "F", "F", "F", "F", "F"],
    ["J", "I", "J", "I", "J", "F", "F", "J", "J", "J"],
    ["J", "I", "J", "I", "J", "I", "F", "H", "J", "F"],
    ["I", "J", "I", "I", "J", "I", "I", "H", "J", "F"],
    ["I", "I", "I", "I", "I", "I", "H", "H", "H", "G"],
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
