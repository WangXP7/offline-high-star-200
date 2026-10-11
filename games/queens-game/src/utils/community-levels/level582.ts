import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/582",
  size: 11,
  colorRegions: [
    ["G", "I", "I", "I", "K", "K", "K", "F", "F", "F", "A"],
    ["G", "G", "G", "I", "K", "K", "K", "K", "F", "F", "A"],
    ["G", "G", "G", "G", "K", "K", "J", "K", "F", "F", "A"],
    ["G", "H", "H", "G", "K", "K", "J", "J", "F", "F", "A"],
    ["G", "H", "G", "G", "K", "J", "J", "J", "F", "D", "A"],
    ["G", "H", "H", "G", "K", "K", "J", "J", "J", "D", "A"],
    ["H", "H", "H", "H", "K", "J", "J", "D", "D", "D", "A"],
    ["H", "H", "H", "H", "H", "H", "H", "D", "A", "A", "A"],
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "C"],
    ["B", "B", "C", "C", "C", "C", "E", "E", "E", "E", "C"],
    ["B", "C", "C", "C", "C", "C", "C", "C", "C", "C", "C"],
  ],
  regionColors: {
    A: white,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
    I: lightOrchid,
    J: lightWisteria,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "diegovedove",
  creatorLink: "https://www.instagram.com/diegovedove?igsh=NnE4dm0waWI1aWkz",
};

export default level;
