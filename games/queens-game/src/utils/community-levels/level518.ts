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
  path: "/community-level/518",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["B", "C", "C", "C", "C", "C", "C", "C", "C", "C", "A"],
    ["B", "C", "E", "E", "E", "E", "E", "E", "E", "D", "A"],
    ["B", "C", "F", "H", "J", "J", "J", "H", "E", "D", "A"],
    ["B", "C", "F", "H", "J", "J", "I", "H", "E", "D", "A"],
    ["B", "C", "F", "J", "J", "K", "I", "J", "E", "D", "A"],
    ["B", "C", "F", "G", "J", "I", "I", "G", "E", "D", "A"],
    ["B", "C", "F", "G", "J", "J", "I", "G", "E", "D", "A"],
    ["B", "C", "F", "F", "F", "F", "F", "F", "E", "D", "A"],
    ["B", "C", "D", "D", "D", "D", "D", "D", "D", "D", "A"],
    ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "A"],
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
  createdBy: "D0minos",
  creatorLink: "",
};

export default level;
