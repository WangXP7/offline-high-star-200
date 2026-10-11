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
  path: "/community-level/620",
  size: 11,
  colorRegions: [
    ["F", "F", "F", "A", "A", "A", "A", "A", "G", "A", "G"],
    ["A", "E", "E", "E", "C", "E", "E", "E", "E", "E", "G"],
    ["F", "E", "B", "B", "B", "B", "A", "K", "K", "E", "G"],
    ["A", "E", "A", "C", "C", "C", "C", "C", "K", "E", "A"],
    ["A", "C", "A", "C", "B", "B", "B", "C", "K", "C", "A"],
    ["A", "C", "A", "C", "B", "A", "B", "C", "A", "C", "A"],
    ["A", "C", "D", "C", "B", "B", "B", "E", "A", "C", "A"],
    ["A", "E", "D", "C", "C", "C", "C", "C", "A", "E", "A"],
    ["H", "E", "D", "D", "A", "A", "J", "J", "J", "E", "I"],
    ["H", "E", "E", "E", "E", "E", "C", "E", "E", "E", "A"],
    ["H", "A", "H", "A", "A", "A", "A", "A", "I", "I", "I"],
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
  createdBy: "meyina",
  creatorLink: "",
};

export default level;
