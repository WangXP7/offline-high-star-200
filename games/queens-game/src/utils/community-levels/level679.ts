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
  path: "/community-level/679",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "B", "A", "A", "A", "H", "A", "A", "A"],
    ["K", "B", "A", "I", "I", "E", "B", "A", "B", "B", "K"],
    ["A", "A", "A", "B", "E", "E", "C", "H", "A", "D", "A"],
    ["J", "A", "A", "B", "E", "F", "A", "H", "A", "G", "A"],
    ["J", "D", "F", "F", "F", "F", "A", "B", "G", "G", "K"],
    ["J", "A", "A", "H", "A", "A", "A", "A", "A", "G", "A"],
    ["J", "A", "B", "A", "B", "A", "H", "H", "H", "C", "H"],
    ["J", "A", "A", "H", "A", "A", "A", "I", "A", "A", "A"],
    ["J", "B", "A", "H", "A", "A", "D", "I", "A", "A", "A"],
    ["J", "J", "J", "K", "A", "A", "F", "F", "F", "F", "F"],
    ["A", "A", "J", "B", "A", "A", "A", "B", "A", "A", "J"],
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
  createdBy: "dakota",
  creatorLink: "",
};

export default level;
