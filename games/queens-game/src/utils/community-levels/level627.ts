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
  path: "/community-level/627",
  size: 11,
  colorRegions: [
    ["A", "C", "C", "K", "K", "K", "B", "B", "B", "B", "B"],
    ["C", "C", "C", "K", "K", "J", "B", "B", "B", "B", "B"],
    ["F", "C", "K", "K", "J", "J", "B", "B", "E", "E", "B"],
    ["F", "K", "K", "K", "J", "B", "B", "B", "E", "E", "B"],
    ["F", "F", "J", "J", "J", "B", "B", "B", "E", "E", "B"],
    ["F", "J", "J", "G", "G", "G", "G", "G", "E", "D", "B"],
    ["J", "J", "I", "I", "I", "G", "G", "H", "H", "D", "B"],
    ["B", "B", "I", "I", "I", "G", "G", "H", "H", "D", "B"],
    ["B", "B", "I", "I", "I", "G", "G", "D", "D", "D", "B"],
    ["B", "B", "I", "I", "G", "G", "G", "D", "D", "D", "B"],
    ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"],
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
  createdBy: "BreezeBlaze",
  creatorLink: "https://github.com/BreezeBlaze",
};

export default level;
