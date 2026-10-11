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
  path: "/community-level/592",
  size: 11,
  colorRegions: [
    ["J", "K", "J", "K", "I", "K", "I", "I", "I", "I", "I"],
    ["J", "J", "J", "K", "I", "K", "I", "K", "K", "K", "I"],
    ["J", "J", "D", "K", "I", "K", "I", "I", "K", "I", "I"],
    ["J", "C", "D", "K", "I", "K", "K", "K", "K", "K", "I"],
    ["A", "C", "D", "K", "I", "I", "I", "I", "I", "I", "I"],
    ["A", "C", "D", "K", "K", "K", "K", "H", "H", "H", "I"],
    ["A", "C", "D", "K", "K", "G", "G", "G", "G", "H", "I"],
    ["A", "C", "D", "E", "E", "E", "E", "E", "G", "H", "I"],
    ["A", "C", "D", "D", "D", "D", "F", "E", "G", "H", "I"],
    ["A", "C", "C", "C", "C", "C", "F", "F", "F", "F", "F"],
    ["B", "B", "B", "B", "B", "B", "F", "F", "F", "F", "F"],
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
