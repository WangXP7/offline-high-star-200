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
  path: "/community-level/622",
  size: 10,
  colorRegions: [
    ["I", "I", "I", "I", "I", "I", "J", "J", "J", "J"],
    ["I", "A", "A", "A", "I", "I", "B", "B", "B", "B"],
    ["I", "A", "H", "H", "H", "J", "G", "G", "B", "J"],
    ["I", "A", "H", "J", "J", "J", "J", "G", "B", "J"],
    ["I", "I", "H", "J", "J", "J", "J", "G", "B", "J"],
    ["I", "I", "E", "J", "J", "J", "J", "J", "J", "J"],
    ["I", "I", "E", "J", "J", "J", "J", "F", "C", "J"],
    ["I", "D", "E", "E", "J", "J", "F", "F", "C", "J"],
    ["I", "D", "D", "D", "D", "J", "J", "C", "C", "J"],
    ["I", "I", "I", "I", "I", "J", "J", "J", "J", "J"],
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
  createdBy: "I-R-G0ne",
  creatorLink: "",
};

export default level;
