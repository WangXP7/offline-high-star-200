import {
  altoMain,
  anakiwa,
  atomicTangerine,
  bittersweet,
  emerald,
  lightGreen,
  lightOrchid,
  lightWisteria,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/600",
  size: 11,
  colorRegions: [
    ["F", "F", "F", "F", "I", "J", "E", "E", "E", "E", "K"],
    ["F", "I", "K", "A", "I", "J", "I", "E", "I", "B", "K"],
    ["A", "E", "E", "A", "A", "I", "H", "E", "B", "B", "B"],
    ["I", "I", "J", "J", "I", "I", "I", "J", "J", "I", "I"],
    ["J", "I", "J", "A", "J", "I", "J", "H", "J", "J", "K"],
    ["I", "I", "J", "D", "I", "J", "I", "J", "I", "C", "K"],
    ["G", "G", "G", "D", "G", "J", "D", "H", "C", "C", "C"],
    ["J", "I", "K", "D", "K", "I", "J", "J", "K", "F", "K"],
    ["I", "I", "J", "D", "I", "I", "I", "H", "I", "C", "J"],
    ["G", "I", "K", "E", "I", "I", "I", "I", "I", "F", "K"],
    ["G", "G", "G", "G", "G", "I", "H", "H", "H", "H", "K"],
  ],
  regionColors: {
    A: lightWisteria,
    B: saharaSand,
    C: bittersweet,
    D: altoMain,
    E: white,
    F: anakiwa,
    G: atomicTangerine,
    H: lightOrchid,
    I: lightGreen,
    J: emerald,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "http://linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
