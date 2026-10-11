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
  path: "/community-level/597",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "A", "K", "K", "K", "B", "B", "B", "B"],
    ["H", "H", "H", "A", "K", "K", "K", "B", "K", "K", "B"],
    ["J", "J", "H", "A", "K", "K", "K", "B", "K", "K", "B"],
    ["J", "J", "I", "K", "K", "K", "K", "B", "K", "K", "B"],
    ["J", "I", "I", "I", "I", "K", "K", "K", "K", "J", "J"],
    ["I", "I", "I", "I", "I", "I", "K", "E", "J", "J", "J"],
    ["I", "I", "I", "I", "I", "I", "E", "F", "E", "F", "E"],
    ["J", "J", "G", "I", "K", "I", "I", "E", "J", "J", "J"],
    ["J", "J", "G", "C", "K", "K", "K", "F", "J", "J", "J"],
    ["G", "G", "G", "C", "F", "F", "F", "E", "J", "J", "D"],
    ["F", "C", "C", "C", "F", "F", "F", "D", "D", "D", "D"],
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
  createdBy: "Jess",
  creatorLink: "https://github.com/jess334",
};

export default level;
