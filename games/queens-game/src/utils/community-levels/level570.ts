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
  path: "/community-level/570",
  size: 11,
  colorRegions: [
    ["F", "C", "C", "C", "E", "I", "K", "I", "K", "I", "I"],
    ["C", "C", "E", "C", "E", "I", "K", "I", "K", "I", "I"],
    ["C", "E", "E", "E", "E", "I", "K", "K", "K", "K", "K"],
    ["C", "C", "E", "E", "E", "I", "K", "K", "K", "I", "I"],
    ["E", "E", "E", "E", "E", "I", "I", "K", "K", "K", "K"],
    ["H", "H", "H", "H", "H", "G", "I", "I", "I", "I", "I"],
    ["J", "J", "J", "J", "H", "H", "D", "D", "D", "D", "D"],
    ["H", "H", "J", "J", "J", "H", "D", "D", "D", "B", "B"],
    ["J", "J", "J", "J", "J", "H", "D", "D", "D", "D", "B"],
    ["H", "H", "J", "J", "J", "H", "D", "B", "D", "B", "B"],
    ["H", "H", "J", "H", "J", "H", "D", "B", "B", "B", "A"],
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
  createdBy: "suspect-the-human",
  creatorLink: "",
};

export default level;
