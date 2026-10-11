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
  path: "/community-level/571",
  size: 11,
  colorRegions: [
    ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "A"],
    ["B", "C", "C", "C", "C", "C", "C", "C", "C", "C", "A"],
    ["B", "D", "E", "E", "E", "E", "E", "E", "E", "C", "A"],
    ["B", "D", "E", "G", "H", "H", "H", "H", "F", "C", "A"],
    ["B", "D", "E", "G", "J", "J", "K", "K", "F", "C", "A"],
    ["B", "D", "E", "I", "J", "J", "K", "K", "F", "C", "A"],
    ["B", "D", "E", "I", "J", "J", "K", "K", "F", "C", "A"],
    ["B", "D", "E", "I", "I", "J", "K", "K", "F", "C", "A"],
    ["B", "D", "E", "F", "F", "F", "F", "F", "F", "C", "A"],
    ["B", "D", "D", "D", "D", "D", "D", "D", "D", "C", "A"],
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
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
  createdBy: "Inês",
  creatorLink: "",
};

export default level;
