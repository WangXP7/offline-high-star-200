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
  path: "/community-level/672",
  size: 11,
  colorRegions: [
    ["C", "A", "C", "C", "J", "C", "C", "C", "G", "G", "C"],
    ["C", "C", "C", "C", "C", "C", "C", "C", "G", "G", "C"],
    ["C", "C", "C", "F", "F", "A", "C", "C", "C", "G", "C"],
    ["F", "F", "F", "F", "F", "F", "C", "C", "C", "C", "C"],
    ["C", "F", "F", "F", "F", "F", "F", "C", "C", "C", "I"],
    ["F", "F", "E", "E", "E", "E", "E", "F", "C", "I", "C"],
    ["C", "E", "C", "E", "E", "C", "E", "C", "C", "H", "C"],
    ["C", "E", "E", "B", "E", "E", "E", "C", "C", "H", "C"],
    ["C", "E", "E", "B", "E", "E", "E", "F", "C", "G", "G"],
    ["C", "D", "K", "D", "D", "D", "D", "D", "D", "K", "D"],
    ["C", "D", "D", "D", "D", "K", "D", "D", "D", "D", "D"],
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
  createdBy: "isa",
  creatorLink: "",
};

export default level;
