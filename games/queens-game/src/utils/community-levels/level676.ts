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
  path: "/community-level/676",
  size: 11,
  colorRegions: [
    ["K", "J", "J", "J", "J", "J", "J", "J", "J", "J", "J"],
    ["K", "A", "K", "I", "F", "C", "F", "C", "K", "K", "J"],
    ["K", "B", "D", "I", "I", "D", "G", "H", "K", "K", "J"],
    ["K", "C", "D", "I", "I", "C", "G", "H", "K", "K", "J"],
    ["K", "K", "E", "C", "K", "C", "G", "H", "K", "K", "J"],
    ["K", "K", "F", "K", "K", "G", "K", "K", "F", "K", "J"],
    ["K", "K", "K", "H", "G", "B", "K", "B", "E", "K", "J"],
    ["K", "K", "K", "H", "G", "B", "I", "I", "D", "C", "J"],
    ["K", "K", "K", "H", "G", "B", "I", "I", "D", "B", "J"],
    ["K", "K", "K", "C", "F", "C", "F", "I", "K", "A", "J"],
    ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
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
