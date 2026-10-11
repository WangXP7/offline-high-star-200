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
} from "../colors";

const level = {
  path: "/community-level/601",
  size: 10,
  colorRegions: [
    ["H", "H", "H", "J", "H", "D", "B", "G", "G", "G"],
    ["H", "J", "J", "J", "A", "D", "J", "J", "J", "G"],
    ["H", "J", "I", "I", "I", "I", "I", "I", "J", "G"],
    ["C", "J", "I", "J", "J", "J", "J", "I", "J", "J"],
    ["A", "A", "I", "J", "A", "D", "J", "I", "D", "G"],
    ["E", "B", "I", "J", "B", "C", "J", "I", "C", "C"],
    ["J", "J", "I", "J", "J", "J", "J", "I", "J", "F"],
    ["E", "J", "I", "I", "I", "I", "I", "I", "J", "F"],
    ["E", "J", "J", "J", "B", "C", "J", "J", "J", "F"],
    ["E", "E", "E", "D", "B", "F", "J", "F", "F", "F"],
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
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "http://linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
