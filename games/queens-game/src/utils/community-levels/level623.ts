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
  path: "/community-level/623",
  size: 11,
  colorRegions: [
    ["I", "I", "G", "I", "I", "E", "H", "H", "H", "K", "K"],
    ["I", "K", "A", "K", "K", "E", "K", "K", "D", "K", "K"],
    ["I", "A", "F", "A", "A", "A", "K", "D", "C", "D", "G"],
    ["K", "K", "A", "K", "K", "A", "K", "K", "D", "K", "K"],
    ["K", "K", "B", "K", "G", "I", "G", "K", "J", "K", "K"],
    ["E", "B", "J", "B", "I", "H", "I", "J", "B", "J", "E"],
    ["K", "K", "B", "K", "G", "I", "G", "K", "J", "K", "K"],
    ["K", "K", "C", "K", "K", "F", "K", "K", "F", "K", "K"],
    ["G", "C", "D", "C", "K", "F", "F", "F", "A", "F", "I"],
    ["K", "K", "C", "K", "K", "E", "K", "K", "K", "K", "I"],
    ["K", "K", "H", "H", "H", "E", "E", "I", "G", "I", "I"],
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
