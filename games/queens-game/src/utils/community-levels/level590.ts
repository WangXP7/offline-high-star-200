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
  path: "/community-level/590",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["B", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["B", "A", "C", "C", "A", "A", "D", "D", "D", "A", "A"],
    ["B", "B", "C", "A", "A", "A", "A", "E", "D", "F", "F"],
    ["B", "B", "C", "B", "B", "A", "A", "E", "D", "F", "G"],
    ["B", "B", "B", "B", "B", "A", "A", "E", "F", "F", "G"],
    ["B", "B", "H", "B", "E", "E", "E", "E", "I", "G", "G"],
    ["B", "B", "H", "H", "H", "E", "E", "I", "I", "G", "G"],
    ["J", "B", "J", "J", "E", "E", "E", "K", "K", "G", "G"],
    ["J", "B", "J", "J", "J", "K", "K", "K", "K", "K", "G"],
    ["J", "J", "J", "J", "J", "K", "K", "K", "K", "K", "G"],
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
  createdBy: "mattsemar",
  creatorLink: "https://github.com/mattsemar",
};

export default level;
