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
  path: "/community-level/516",
  size: 11,
  colorRegions: [
    ["C", "C", "J", "J", "J", "J", "J", "J", "B", "B", "B"],
    ["A", "J", "J", "H", "H", "G", "H", "J", "J", "J", "F"],
    ["J", "J", "H", "G", "H", "G", "H", "H", "H", "J", "F"],
    ["J", "H", "H", "G", "G", "G", "F", "H", "H", "H", "J"],
    ["J", "H", "H", "F", "G", "G", "F", "H", "H", "H", "J"],
    ["J", "A", "H", "F", "A", "A", "F", "A", "H", "H", "J"],
    ["K", "J", "H", "E", "A", "F", "F", "H", "H", "H", "J"],
    ["K", "J", "E", "H", "H", "H", "H", "F", "H", "J", "J"],
    ["K", "K", "J", "E", "H", "H", "H", "F", "J", "J", "D"],
    ["B", "K", "K", "J", "J", "J", "J", "J", "I", "A", "D"],
    ["B", "B", "B", "B", "I", "I", "I", "I", "I", "A", "D"],
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
  createdBy: "Dougoumé",
  creatorLink: "https://github.com/trem0L0",
};

export default level;
