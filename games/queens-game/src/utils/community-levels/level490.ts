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
  path: "/community-level/490",
  size: 11,
  colorRegions: [
    ["A", "A", "K", "B", "B", "B", "B", "B", "J", "J", "J"],
    ["A", "A", "K", "D", "B", "B", "B", "G", "J", "J", "J"],
    ["A", "A", "A", "D", "D", "B", "G", "G", "J", "J", "J"],
    ["A", "K", "K", "D", "F", "F", "G", "G", "J", "J", "J"],
    ["A", "A", "A", "D", "F", "F", "F", "G", "J", "J", "J"],
    ["A", "K", "K", "D", "F", "E", "F", "G", "J", "J", "J"],
    ["A", "A", "A", "D", "F", "F", "F", "G", "J", "J", "J"],
    ["K", "K", "K", "D", "D", "F", "G", "G", "H", "H", "J"],
    ["I", "K", "K", "D", "C", "G", "G", "G", "G", "H", "J"],
    ["I", "I", "K", "D", "C", "C", "G", "C", "G", "H", "J"],
    ["I", "I", "I", "D", "C", "C", "C", "C", "G", "H", "J"],
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
  createdBy: "Meyina",
  creatorLink: "https://www.instagram.com/meyina009/",
};

export default level;
