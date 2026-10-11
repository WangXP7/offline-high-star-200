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
  path: "/community-level/492",
  size: 11,
  colorRegions: [
    ["B", "B", "B", "B", "B", "A", "D", "D", "I", "J", "J"],
    ["B", "C", "C", "B", "A", "A", "D", "D", "I", "I", "J"],
    ["B", "C", "B", "B", "A", "A", "D", "D", "I", "I", "J"],
    ["B", "C", "C", "B", "A", "A", "D", "D", "I", "K", "K"],
    ["B", "B", "B", "B", "A", "A", "D", "D", "I", "I", "K"],
    ["A", "A", "A", "A", "A", "A", "D", "D", "I", "I", "K"],
    ["E", "E", "E", "E", "D", "D", "D", "D", "H", "H", "K"],
    ["E", "F", "G", "D", "D", "D", "D", "D", "H", "H", "K"],
    ["E", "F", "G", "D", "D", "D", "D", "D", "H", "H", "K"],
    ["F", "F", "G", "D", "D", "D", "D", "D", "H", "H", "K"],
    ["F", "G", "G", "D", "D", "D", "D", "H", "H", "H", "K"],
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
  createdBy: "EricPHathaway",
  creatorLink: "https://github.com/EricPHathaway",
};

export default level;
