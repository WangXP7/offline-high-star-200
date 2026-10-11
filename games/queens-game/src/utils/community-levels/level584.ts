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
  path: "/community-level/584",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "B", "B", "B", "B"],
    ["C", "A", "A", "A", "K", "I", "F", "F", "F", "F", "I"],
    ["C", "A", "I", "K", "K", "I", "I", "I", "I", "F", "I"],
    ["C", "A", "I", "K", "K", "K", "K", "I", "I", "I", "I"],
    ["C", "C", "I", "J", "K", "K", "K", "K", "K", "D", "I"],
    ["I", "C", "I", "J", "J", "J", "K", "K", "K", "D", "I"],
    ["I", "I", "I", "J", "J", "J", "J", "K", "K", "D", "I"],
    ["I", "G", "J", "J", "J", "J", "J", "K", "K", "D", "I"],
    ["I", "G", "G", "G", "J", "D", "D", "D", "D", "D", "I"],
    ["E", "G", "G", "G", "G", "G", "G", "G", "G", "G", "H"],
    ["E", "E", "E", "G", "G", "G", "G", "G", "G", "H", "H"],
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
  createdBy: "Jess",
  creatorLink: "",
};

export default level;
