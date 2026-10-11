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
  path: "/community-level/485",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "A", "C", "E", "E", "E", "E", "B", "B"],
    ["A", "A", "A", "A", "C", "C", "C", "C", "E", "B", "F"],
    ["A", "G", "A", "C", "C", "C", "B", "B", "B", "B", "F"],
    ["A", "G", "G", "G", "H", "C", "B", "F", "F", "F", "F"],
    ["G", "G", "G", "H", "H", "D", "F", "F", "F", "J", "J"],
    ["G", "H", "H", "H", "H", "D", "D", "D", "F", "F", "J"],
    ["G", "H", "I", "I", "I", "J", "J", "J", "J", "J", "J"],
    ["G", "H", "I", "J", "J", "J", "K", "K", "K", "J", "J"],
    ["G", "H", "I", "I", "J", "J", "K", "K", "K", "K", "J"],
    ["I", "I", "I", "I", "J", "K", "K", "K", "K", "K", "J"],
    ["I", "I", "I", "K", "K", "K", "K", "K", "K", "J", "J"],
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
  createdBy: "Dan Relaxxe",
  creatorLink: "https://github.com/DanRelaxxe",
};

export default level;
