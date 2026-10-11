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
  path: "/community-level/512",
  size: 11,
  colorRegions: [
    ["F", "F", "F", "F", "F", "B", "B", "B", "B", "B", "B"],
    ["F", "F", "F", "F", "G", "B", "B", "B", "B", "B", "B"],
    ["F", "F", "F", "F", "G", "B", "G", "B", "B", "B", "H"],
    ["F", "F", "F", "F", "G", "G", "G", "B", "B", "H", "H"],
    ["A", "A", "A", "A", "G", "G", "G", "B", "B", "H", "H"],
    ["A", "D", "D", "E", "G", "G", "B", "B", "B", "H", "H"],
    ["A", "D", "D", "E", "G", "B", "B", "B", "H", "H", "H"],
    ["A", "A", "A", "A", "G", "B", "B", "H", "H", "H", "J"],
    ["A", "C", "A", "A", "G", "I", "I", "H", "K", "J", "J"],
    ["A", "C", "C", "A", "G", "I", "I", "K", "K", "J", "J"],
    ["A", "A", "A", "A", "G", "K", "K", "K", "J", "J", "J"],
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
  createdBy: "676767",
  creatorLink: "",
};

export default level;
