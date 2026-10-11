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
  path: "/community-level/583",
  size: 11,
  colorRegions: [
    ["B", "B", "B", "A", "A", "A", "J", "H", "H", "H", "H"],
    ["B", "A", "A", "A", "A", "J", "J", "J", "C", "C", "H"],
    ["B", "A", "J", "J", "J", "J", "J", "J", "G", "C", "H"],
    ["B", "A", "J", "J", "J", "J", "J", "J", "G", "C", "C"],
    ["B", "A", "J", "J", "J", "J", "G", "G", "G", "C", "C"],
    ["A", "A", "J", "J", "J", "G", "G", "G", "G", "C", "K"],
    ["G", "G", "G", "G", "G", "I", "I", "I", "I", "I", "K"],
    ["F", "F", "G", "I", "I", "I", "I", "I", "I", "K", "K"],
    ["E", "F", "I", "I", "I", "I", "I", "I", "I", "K", "K"],
    ["E", "F", "F", "F", "I", "I", "K", "K", "K", "K", "D"],
    ["E", "E", "E", "E", "I", "I", "K", "D", "D", "D", "D"],
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
