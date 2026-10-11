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
  path: "/community-level/501",
  size: 11,
  colorRegions: [
    ["A", "B", "B", "C", "C", "C", "C", "D", "D", "D", "D"],
    ["A", "B", "B", "C", "C", "C", "C", "C", "D", "C", "E"],
    ["A", "B", "B", "B", "B", "C", "C", "C", "C", "C", "E"],
    ["A", "B", "B", "B", "B", "B", "B", "C", "C", "C", "C"],
    ["A", "F", "F", "F", "F", "F", "B", "C", "C", "C", "C"],
    ["A", "F", "F", "F", "F", "F", "C", "C", "C", "C", "C"],
    ["A", "A", "F", "G", "F", "F", "C", "C", "H", "H", "C"],
    ["A", "F", "F", "G", "I", "I", "I", "H", "H", "J", "J"],
    ["A", "A", "F", "F", "I", "I", "I", "H", "H", "J", "J"],
    ["A", "A", "A", "F", "I", "I", "K", "K", "H", "H", "H"],
    ["A", "A", "A", "I", "I", "K", "K", "H", "H", "H", "H"],
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
  createdBy: "LSM",
  creatorLink: "",
};

export default level;
