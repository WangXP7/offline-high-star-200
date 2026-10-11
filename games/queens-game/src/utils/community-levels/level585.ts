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
  path: "/community-level/585",
  size: 11,
  colorRegions: [
    ["A", "B", "B", "B", "B", "B", "C", "C", "C", "C", "C"],
    ["A", "A", "A", "B", "B", "B", "B", "D", "D", "D", "C"],
    ["A", "A", "A", "B", "B", "D", "D", "D", "C", "C", "C"],
    ["A", "A", "A", "D", "D", "D", "D", "E", "E", "E", "E"],
    ["F", "F", "A", "H", "H", "H", "H", "I", "I", "I", "I"],
    ["F", "F", "A", "A", "A", "H", "H", "H", "I", "I", "I"],
    ["F", "F", "F", "F", "A", "A", "A", "H", "H", "H", "I"],
    ["F", "F", "G", "F", "F", "F", "A", "H", "H", "I", "I"],
    ["F", "F", "G", "G", "G", "F", "A", "J", "H", "I", "I"],
    ["F", "F", "G", "G", "G", "F", "A", "J", "H", "I", "K"],
    ["F", "G", "G", "G", "G", "G", "G", "J", "J", "I", "K"],
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
  createdBy: "TWBY",
  creatorLink: "",
};

export default level;
