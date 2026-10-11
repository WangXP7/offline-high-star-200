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
  path: "/community-level/670",
  size: 11,
  colorRegions: [
    ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
    ["K", "K", "K", "K", "F", "K", "K", "K", "I", "I", "I"],
    ["K", "K", "B", "K", "F", "J", "J", "J", "K", "I", "K"],
    ["K", "K", "B", "F", "F", "F", "J", "K", "K", "I", "K"],
    ["A", "B", "B", "B", "K", "K", "J", "K", "K", "K", "K"],
    ["A", "A", "A", "K", "D", "E", "K", "K", "K", "K", "K"],
    ["A", "K", "D", "D", "D", "E", "E", "E", "K", "K", "K"],
    ["K", "K", "K", "C", "D", "E", "K", "K", "K", "H", "C"],
    ["K", "C", "C", "C", "G", "K", "K", "H", "H", "H", "K"],
    ["K", "K", "K", "C", "G", "K", "K", "K", "K", "H", "K"],
    ["K", "K", "K", "G", "G", "G", "C", "K", "K", "K", "K"],
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
