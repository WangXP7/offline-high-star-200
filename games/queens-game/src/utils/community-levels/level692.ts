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
  path: "/community-level/692",
  size: 11,
  colorRegions: [
    ["H", "H", "H", "H", "E", "F", "G", "I", "I", "J", "K"],
    ["H", "B", "C", "D", "E", "F", "G", "I", "J", "J", "K"],
    ["H", "B", "C", "D", "E", "F", "G", "I", "J", "J", "K"],
    ["H", "B", "C", "D", "E", "F", "G", "I", "I", "K", "K"],
    ["A", "B", "C", "D", "E", "F", "G", "G", "K", "K", "K"],
    ["A", "B", "C", "D", "E", "F", "F", "E", "E", "K", "K"],
    ["A", "B", "C", "D", "E", "E", "E", "E", "E", "E", "K"],
    ["A", "B", "C", "D", "D", "D", "D", "D", "D", "C", "B"],
    ["A", "B", "C", "C", "C", "C", "C", "C", "C", "C", "B"],
    ["A", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"],
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
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
  createdBy: "Clm",
  creatorLink: "",
};

export default level;
