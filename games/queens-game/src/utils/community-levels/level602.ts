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
  path: "/community-level/602",
  size: 11,
  colorRegions: [
    ["C", "C", "C", "C", "C", "C", "C", "C", "C", "C", "A"],
    ["C", "D", "D", "D", "D", "D", "D", "F", "F", "F", "A"],
    ["C", "D", "E", "E", "H", "H", "K", "K", "K", "F", "A"],
    ["C", "D", "E", "H", "H", "H", "H", "H", "K", "F", "A"],
    ["C", "E", "E", "H", "H", "H", "H", "H", "K", "F", "A"],
    ["C", "E", "H", "H", "H", "H", "H", "H", "B", "G", "A"],
    ["C", "H", "H", "H", "H", "H", "H", "H", "B", "G", "A"],
    ["C", "H", "J", "H", "H", "H", "H", "H", "B", "G", "A"],
    ["A", "I", "J", "J", "J", "H", "B", "B", "B", "G", "A"],
    ["A", "I", "I", "I", "I", "G", "G", "G", "G", "G", "A"],
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
  createdBy: "momentum",
  creatorLink: "",
};

export default level;
