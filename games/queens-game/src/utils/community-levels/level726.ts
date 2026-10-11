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
  path: "/community-level/726",
  size: 11,
  colorRegions: [
    ["F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "C"],
    ["E", "F", "A", "F", "F", "D", "C", "C", "C", "C", "C"],
    ["E", "F", "A", "F", "F", "D", "D", "D", "C", "C", "C"],
    ["E", "F", "A", "F", "F", "D", "D", "B", "B", "C", "C"],
    ["E", "E", "A", "A", "F", "D", "B", "B", "B", "C", "C"],
    ["I", "F", "F", "F", "F", "F", "G", "G", "G", "G", "G"],
    ["I", "I", "I", "I", "F", "H", "G", "G", "G", "G", "G"],
    ["I", "I", "J", "I", "I", "H", "G", "G", "G", "G", "G"],
    ["I", "J", "J", "J", "I", "H", "H", "H", "G", "G", "G"],
    ["K", "J", "I", "I", "I", "G", "H", "G", "G", "G", "G"],
    ["K", "K", "I", "I", "G", "G", "G", "G", "G", "G", "G"],
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
  createdBy: "Clmmm",
  creatorLink: "",
};

export default level;
