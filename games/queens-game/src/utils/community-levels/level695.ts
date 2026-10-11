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
  path: "/community-level/695",
  size: 11,
  colorRegions: [
    ["A", "B", "B", "J", "J", "I", "J", "J", "B", "B", "A"],
    ["C", "E", "E", "E", "H", "H", "C", "H", "H", "I", "B"],
    ["J", "E", "J", "H", "H", "C", "H", "G", "I", "K", "B"],
    ["C", "E", "H", "C", "C", "H", "C", "I", "D", "K", "C"],
    ["J", "H", "H", "H", "J", "H", "I", "C", "K", "C", "J"],
    ["J", "H", "C", "C", "H", "I", "K", "K", "C", "K", "J"],
    ["C", "C", "C", "H", "I", "K", "J", "C", "K", "K", "C"],
    ["C", "H", "C", "I", "K", "C", "K", "C", "K", "E", "C"],
    ["J", "H", "C", "C", "C", "C", "K", "K", "J", "F", "B"],
    ["D", "I", "K", "K", "C", "K", "K", "F", "F", "F", "B"],
    ["A", "G", "J", "C", "J", "I", "C", "J", "C", "J", "A"],
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
  createdBy: "GuillermoAbadLopez",
  creatorLink: "https://github.com/GuillermoAbadLopez",
};

export default level;
