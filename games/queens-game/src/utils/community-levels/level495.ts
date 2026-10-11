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
  path: "/community-level/495",
  size: 11,
  colorRegions: [
    ["I", "I", "I", "J", "J", "J", "J", "J", "J", "K", "K"],
    ["E", "I", "F", "F", "F", "F", "F", "F", "H", "K", "K"],
    ["E", "E", "F", "B", "B", "B", "B", "F", "H", "K", "K"],
    ["E", "E", "F", "F", "F", "A", "F", "F", "H", "H", "K"],
    ["H", "H", "F", "G", "A", "A", "G", "F", "H", "H", "K"],
    ["H", "H", "F", "G", "G", "A", "G", "F", "H", "C", "C"],
    ["H", "H", "F", "H", "G", "G", "G", "F", "H", "C", "C"],
    ["H", "H", "H", "H", "H", "G", "G", "H", "H", "C", "C"],
    ["D", "H", "H", "D", "H", "H", "H", "H", "D", "C", "C"],
    ["D", "H", "H", "D", "D", "D", "D", "D", "D", "C", "C"],
    ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "C"],
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
  createdBy: "SilvershadeSmith",
  creatorLink: "",
};

export default level;
