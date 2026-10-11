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
  path: "/community-level/688",
  size: 11,
  colorRegions: [
    ["C", "C", "C", "A", "C", "C", "C", "A", "B", "B", "A"],
    ["C", "H", "H", "A", "H", "H", "H", "A", "H", "H", "A"],
    ["C", "H", "E", "I", "E", "E", "C", "I", "E", "B", "A"],
    ["C", "H", "K", "J", "E", "K", "E", "D", "K", "B", "A"],
    ["B", "B", "D", "G", "I", "E", "J", "G", "H", "H", "H"],
    ["C", "H", "K", "K", "K", "I", "K", "K", "K", "B", "A"],
    ["B", "B", "D", "G", "I", "F", "J", "G", "H", "H", "H"],
    ["C", "H", "K", "J", "F", "K", "F", "D", "K", "B", "A"],
    ["C", "H", "F", "C", "A", "F", "F", "C", "F", "B", "A"],
    ["A", "B", "B", "C", "B", "B", "B", "C", "B", "B", "A"],
    ["A", "A", "A", "C", "A", "A", "A", "C", "A", "A", "A"],
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
