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
  path: "/community-level/642",
  size: 11,
  colorRegions: [
    ["D", "C", "C", "C", "C", "E", "C", "C", "B", "B", "B"],
    ["D", "C", "G", "G", "G", "G", "G", "G", "B", "B", "B"],
    ["C", "C", "G", "A", "A", "A", "A", "A", "B", "B", "B"],
    ["G", "G", "G", "A", "J", "J", "J", "J", "I", "H", "F"],
    ["A", "A", "A", "A", "J", "E", "E", "J", "I", "H", "F"],
    ["J", "J", "J", "J", "J", "E", "E", "J", "I", "H", "E"],
    ["J", "E", "E", "E", "E", "J", "J", "J", "I", "H", "F"],
    ["J", "E", "J", "J", "E", "J", "I", "I", "I", "H", "F"],
    ["J", "E", "J", "J", "E", "J", "I", "H", "H", "H", "F"],
    ["J", "E", "E", "E", "E", "J", "I", "H", "F", "F", "F"],
    ["J", "J", "J", "J", "J", "J", "I", "H", "F", "K", "K"],
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
  createdBy: "Frankie",
  creatorLink: "https://github.com/Frankie-Christie",
};

export default level;
