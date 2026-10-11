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
  path: "/community-level/558",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["B", "C", "C", "A", "E", "A", "F", "F", "A", "H", "A"],
    ["B", "C", "C", "A", "E", "E", "E", "F", "F", "H", "A"],
    ["B", "C", "B", "A", "E", "E", "E", "F", "F", "H", "H"],
    ["B", "C", "B", "A", "G", "G", "G", "F", "H", "H", "H"],
    ["B", "B", "B", "A", "G", "A", "G", "G", "H", "H", "H"],
    ["B", "D", "D", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["D", "D", "A", "A", "J", "J", "J", "J", "A", "K", "A"],
    ["D", "D", "A", "I", "J", "J", "J", "K", "K", "K", "A"],
    ["D", "A", "A", "I", "I", "I", "J", "K", "K", "K", "A"],
    ["D", "A", "A", "A", "I", "I", "I", "I", "I", "I", "A"],
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
  createdBy: "gmi",
  creatorLink: "https://github.com/gmi",
};

export default level;
