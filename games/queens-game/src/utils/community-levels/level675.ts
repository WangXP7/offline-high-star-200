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
  path: "/community-level/675",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "H", "A", "A", "A", "H", "F", "F", "E"],
    ["A", "A", "A", "I", "A", "A", "A", "H", "A", "H", "E"],
    ["A", "A", "A", "K", "A", "A", "K", "H", "A", "A", "E"],
    ["A", "A", "A", "K", "A", "A", "A", "H", "G", "G", "E"],
    ["A", "A", "A", "C", "A", "A", "J", "G", "G", "G", "I"],
    ["A", "A", "A", "C", "A", "A", "A", "J", "J", "G", "E"],
    ["K", "C", "C", "A", "D", "D", "D", "J", "J", "A", "E"],
    ["I", "A", "C", "C", "B", "F", "B", "J", "C", "C", "E"],
    ["K", "A", "A", "B", "B", "B", "B", "J", "J", "A", "E"],
    ["K", "D", "D", "A", "A", "A", "A", "H", "A", "A", "E"],
    ["E", "E", "E", "A", "E", "E", "E", "E", "E", "E", "A"],
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
  createdBy: "jnielson616",
  creatorLink: "https://github.com/jnielson616",
};

export default level;
