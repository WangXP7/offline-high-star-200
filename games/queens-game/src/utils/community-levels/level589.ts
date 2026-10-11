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
  path: "/community-level/589",
  size: 11,
  colorRegions: [
    ["E", "E", "E", "E", "I", "I", "I", "J", "J", "J", "J"],
    ["E", "I", "I", "A", "K", "K", "K", "F", "I", "I", "I"],
    ["A", "A", "A", "A", "A", "I", "I", "F", "F", "J", "J"],
    ["I", "I", "I", "A", "K", "K", "K", "F", "I", "I", "I"],
    ["I", "I", "I", "A", "K", "K", "K", "K", "I", "I", "I"],
    ["I", "I", "K", "K", "K", "K", "K", "D", "K", "K", "I"],
    ["C", "C", "C", "C", "I", "D", "D", "D", "D", "H", "B"],
    ["H", "H", "H", "C", "K", "K", "K", "H", "H", "H", "B"],
    ["H", "H", "H", "I", "K", "K", "K", "D", "H", "H", "B"],
    ["G", "H", "H", "I", "K", "K", "K", "D", "I", "H", "B"],
    ["G", "G", "G", "G", "I", "I", "I", "D", "I", "B", "B"],
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
