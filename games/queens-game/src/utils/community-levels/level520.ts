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
  path: "/community-level/520",
  size: 11,
  colorRegions: [
    ["A", "A", "B", "B", "D", "E", "G", "C", "C", "I", "K"],
    ["B", "A", "B", "B", "D", "E", "G", "G", "C", "I", "K"],
    ["B", "A", "A", "B", "D", "E", "G", "G", "C", "I", "J"],
    ["B", "B", "B", "B", "D", "E", "G", "G", "C", "I", "J"],
    ["B", "D", "D", "D", "D", "E", "G", "G", "C", "I", "J"],
    ["D", "D", "D", "D", "D", "E", "G", "G", "C", "I", "J"],
    ["D", "D", "E", "E", "E", "F", "F", "G", "C", "I", "J"],
    ["E", "E", "E", "F", "F", "F", "G", "G", "C", "I", "J"],
    ["F", "F", "F", "F", "G", "G", "G", "H", "I", "I", "J"],
    ["G", "G", "G", "G", "G", "H", "H", "I", "I", "I", "J"],
    ["H", "H", "H", "H", "H", "H", "I", "I", "I", "J", "J"],
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
  createdBy: "Plonkthis",
  creatorLink: "",
};

export default level;
