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
  path: "/community-level/484",
  size: 11,
  colorRegions: [
    ["K", "K", "D", "D", "D", "A", "A", "A", "A", "A", "A"],
    ["K", "A", "D", "H", "D", "F", "E", "E", "E", "E", "A"],
    ["A", "A", "H", "H", "F", "B", "F", "E", "A", "E", "A"],
    ["A", "F", "H", "H", "H", "F", "H", "H", "A", "F", "A"],
    ["A", "G", "H", "H", "H", "G", "H", "H", "A", "G", "A"],
    ["A", "G", "G", "H", "G", "G", "G", "H", "G", "G", "E"],
    ["A", "G", "G", "G", "G", "G", "G", "G", "G", "G", "E"],
    ["J", "G", "I", "D", "C", "G", "C", "D", "I", "G", "E"],
    ["J", "G", "D", "C", "G", "G", "G", "C", "D", "G", "A"],
    ["J", "G", "G", "G", "G", "G", "G", "G", "G", "G", "A"],
    ["J", "J", "J", "J", "J", "J", "J", "E", "E", "E", "E"],
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
  createdBy: "Nathan",
  creatorLink: "",
};

export default level;
