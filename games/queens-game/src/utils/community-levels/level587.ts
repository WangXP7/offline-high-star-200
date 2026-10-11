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
  path: "/community-level/587",
  size: 11,
  colorRegions: [
    ["A", "A", "J", "J", "J", "J", "J", "E", "E", "E", "E"],
    ["A", "K", "G", "G", "J", "K", "J", "G", "G", "G", "E"],
    ["A", "G", "G", "G", "B", "K", "J", "G", "G", "G", "J"],
    ["A", "G", "G", "A", "B", "K", "I", "A", "G", "G", "J"],
    ["J", "J", "B", "B", "B", "J", "I", "I", "J", "J", "J"],
    ["J", "K", "K", "K", "J", "J", "J", "K", "K", "K", "J"],
    ["J", "J", "F", "F", "F", "J", "H", "H", "J", "J", "J"],
    ["J", "G", "G", "A", "F", "K", "H", "A", "G", "G", "J"],
    ["C", "G", "G", "G", "J", "K", "J", "G", "G", "G", "J"],
    ["C", "A", "G", "G", "J", "K", "J", "G", "G", "A", "D"],
    ["C", "C", "C", "J", "J", "J", "J", "J", "D", "D", "D"],
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
