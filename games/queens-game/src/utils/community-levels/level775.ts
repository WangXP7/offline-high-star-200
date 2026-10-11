import {
  altoMain,
  anakiwa,
  bittersweet,
  halfBaked,
  lavenderRose,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/775",
  size: 11,
  colorRegions: [
    ["J", "H", "A", "J", "J", "J", "J", "J", "E", "C", "I"],
    ["H", "F", "A", "G", "H", "G", "G", "F", "E", "C", "I"],
    ["J", "H", "E", "K", "K", "K", "K", "K", "E", "I", "I"],
    ["A", "D", "D", "I", "I", "I", "C", "C", "D", "I", "A"],
    ["K", "H", "A", "K", "K", "J", "J", "J", "E", "J", "J"],
    ["K", "H", "A", "K", "K", "K", "J", "J", "G", "J", "J"],
    ["K", "G", "E", "J", "J", "K", "K", "J", "H", "I", "J"],
    ["K", "H", "E", "K", "J", "K", "K", "J", "H", "B", "J"],
    ["I", "D", "D", "B", "B", "B", "D", "I", "E", "B", "B"],
    ["K", "F", "E", "G", "I", "G", "G", "F", "E", "B", "J"],
    ["K", "F", "A", "K", "K", "K", "K", "K", "E", "I", "J"],
  ],
  regionColors: {
    A: lightWisteria,
    B: lavenderRose,
    C: anakiwa,
    D: white,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
    I: lightOrchid,
    J: halfBaked,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "Aneeeii",
  creatorLink: "https://github.com/Aneeeii",
};

export default level;
