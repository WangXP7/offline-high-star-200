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
} from "../colors";

const level = {
  path: "/community-level/568",
  size: 10,
  colorRegions: [
    ["A", "A", "A", "B", "B", "B", "B", "D", "D", "D"],
    ["J", "I", "A", "A", "A", "A", "B", "B", "C", "D"],
    ["I", "J", "I", "I", "I", "A", "C", "D", "C", "C"],
    ["I", "I", "J", "A", "A", "A", "A", "A", "A", "E"],
    ["I", "I", "I", "J", "I", "I", "I", "I", "A", "E"],
    ["G", "I", "I", "I", "J", "J", "J", "J", "A", "E"],
    ["G", "I", "I", "I", "J", "H", "H", "H", "A", "E"],
    ["G", "H", "H", "H", "H", "H", "F", "H", "E", "E"],
    ["G", "H", "G", "G", "F", "F", "F", "F", "H", "F"],
    ["G", "G", "G", "G", "G", "G", "F", "F", "F", "H"],
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
  },
  solutionsCount: 1,
  createdBy: "Tudweiser",
  creatorLink: "",
};

export default level;
