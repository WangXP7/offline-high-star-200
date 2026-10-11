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
  path: "/community-level/718",
  size: 10,
  colorRegions: [
    ["A", "A", "H", "H", "H", "H", "H", "J", "J", "J"],
    ["A", "A", "A", "A", "A", "A", "H", "J", "J", "F"],
    ["A", "A", "G", "A", "G", "I", "H", "I", "J", "F"],
    ["A", "A", "G", "G", "G", "I", "I", "I", "F", "F"],
    ["C", "A", "A", "G", "E", "E", "I", "F", "F", "C"],
    ["C", "A", "B", "G", "B", "D", "I", "D", "F", "C"],
    ["C", "A", "B", "B", "B", "D", "D", "D", "F", "C"],
    ["C", "A", "A", "B", "C", "C", "D", "C", "C", "C"],
    ["C", "C", "A", "B", "C", "C", "D", "C", "C", "C"],
    ["C", "C", "C", "C", "C", "C", "C", "C", "C", "C"],
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
  createdBy: "babi",
  creatorLink: "",
};

export default level;
