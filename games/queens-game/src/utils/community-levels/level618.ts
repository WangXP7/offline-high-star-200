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
  path: "/community-level/618",
  size: 11,
  colorRegions: [
    ["J", "F", "J", "F", "J", "J", "C", "J", "J", "J", "F"],
    ["J", "I", "J", "C", "A", "J", "E", "J", "F", "K", "J"],
    ["J", "G", "J", "F", "J", "J", "H", "J", "D", "J", "J"],
    ["A", "C", "F", "B", "F", "J", "F", "B", "A", "K", "F"],
    ["D", "H", "E", "A", "H", "K", "G", "F", "J", "I", "K"],
    ["J", "F", "J", "F", "J", "J", "I", "J", "F", "J", "J"],
    ["F", "A", "J", "B", "C", "F", "J", "D", "C", "B", "F"],
    ["J", "I", "J", "F", "K", "J", "E", "J", "B", "C", "J"],
    ["J", "F", "J", "C", "J", "J", "D", "J", "F", "J", "J"],
    ["I", "G", "K", "J", "A", "G", "I", "C", "J", "K", "F"],
    ["J", "H", "J", "F", "J", "J", "G", "J", "F", "J", "J"],
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
  creatorLink: "",
};

export default level;
