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
  path: "/community-level/682",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["B", "C", "C", "C", "C", "C", "C", "C", "C", "C", "A"],
    ["B", "D", "D", "D", "D", "D", "D", "D", "D", "C", "A"],
    ["B", "E", "K", "J", "G", "I", "I", "F", "D", "C", "A"],
    ["B", "E", "J", "J", "G", "K", "J", "F", "D", "C", "A"],
    ["B", "E", "E", "E", "E", "K", "K", "H", "D", "C", "A"],
    ["B", "E", "I", "I", "E", "H", "H", "E", "D", "C", "A"],
    ["B", "A", "K", "K", "E", "E", "E", "E", "D", "C", "A"],
    ["B", "C", "J", "K", "E", "F", "G", "E", "D", "C", "A"],
    ["B", "D", "H", "H", "F", "J", "J", "G", "D", "C", "A"],
    ["B", "B", "B", "B", "B", "B", "B", "B", "B", "C", "A"],
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
