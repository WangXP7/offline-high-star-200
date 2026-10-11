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
  path: "/community-level/504",
  size: 11,
  colorRegions: [
    ["B", "B", "B", "B", "B", "B", "B", "E", "E", "E", "A"],
    ["B", "B", "B", "B", "B", "B", "B", "B", "E", "E", "E"],
    ["B", "B", "B", "B", "B", "B", "B", "B", "G", "E", "E"],
    ["B", "B", "B", "B", "F", "B", "F", "G", "G", "C", "E"],
    ["B", "B", "B", "F", "F", "F", "F", "F", "J", "C", "C"],
    ["H", "H", "I", "I", "F", "F", "F", "C", "J", "J", "C"],
    ["H", "K", "I", "K", "C", "F", "C", "C", "J", "J", "J"],
    ["K", "K", "K", "K", "C", "C", "C", "C", "J", "C", "C"],
    ["C", "C", "K", "K", "C", "C", "D", "D", "D", "D", "D"],
    ["C", "C", "K", "C", "C", "C", "C", "D", "D", "D", "C"],
    ["C", "C", "C", "C", "C", "C", "C", "C", "C", "C", "C"],
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
  createdBy: "EricPHathaway",
  creatorLink: "https://github.com/EricPHathaway",
};

export default level;
