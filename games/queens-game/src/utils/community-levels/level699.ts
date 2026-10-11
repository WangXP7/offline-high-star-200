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
  path: "/community-level/699",
  size: 11,
  colorRegions: [
    ["K", "A", "B", "K", "D", "K", "F", "K", "H", "K", "J"],
    ["A", "A", "B", "C", "D", "K", "F", "K", "H", "K", "J"],
    ["B", "B", "B", "C", "D", "K", "F", "K", "H", "K", "J"],
    ["K", "C", "C", "C", "D", "K", "J", "K", "H", "K", "J"],
    ["D", "D", "D", "D", "D", "E", "F", "K", "K", "K", "J"],
    ["K", "K", "K", "K", "E", "E", "F", "K", "H", "K", "J"],
    ["F", "F", "F", "F", "F", "F", "F", "G", "H", "K", "J"],
    ["K", "K", "K", "K", "K", "K", "G", "G", "H", "I", "J"],
    ["H", "H", "H", "H", "I", "H", "H", "H", "H", "I", "J"],
    ["K", "K", "K", "K", "K", "K", "I", "I", "I", "I", "J"],
    ["J", "J", "J", "J", "J", "J", "J", "J", "J", "J", "J"],
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
  createdBy: "detectorsoho",
  creatorLink: "https://github.com/tscotn",
};

export default level;
