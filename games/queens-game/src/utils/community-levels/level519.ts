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
  path: "/community-level/519",
  size: 11,
  colorRegions: [
    ["C", "C", "G", "G", "H", "H", "H", "H", "H", "H", "H"],
    ["C", "G", "G", "G", "G", "G", "G", "G", "G", "G", "H"],
    ["C", "G", "G", "G", "G", "G", "G", "H", "H", "H", "H"],
    ["B", "B", "B", "G", "J", "J", "J", "H", "H", "H", "H"],
    ["B", "B", "B", "G", "I", "J", "J", "H", "H", "H", "H"],
    ["A", "B", "B", "G", "I", "I", "J", "H", "H", "H", "H"],
    ["B", "B", "B", "G", "G", "G", "G", "G", "G", "G", "K"],
    ["B", "B", "B", "B", "E", "E", "E", "E", "E", "E", "E"],
    ["D", "D", "E", "E", "E", "E", "F", "F", "F", "F", "F"],
    ["D", "D", "E", "E", "E", "E", "E", "F", "E", "F", "F"],
    ["D", "D", "D", "E", "E", "E", "E", "E", "E", "E", "F"],
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
  createdBy: "Monsterone",
  creatorLink: "",
};

export default level;
