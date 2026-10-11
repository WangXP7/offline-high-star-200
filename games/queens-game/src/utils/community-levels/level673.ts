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
  path: "/community-level/673",
  size: 11,
  colorRegions: [
    ["C", "C", "C", "C", "C", "G", "C", "F", "F", "F", "F"],
    ["C", "A", "J", "K", "A", "K", "K", "K", "K", "K", "F"],
    ["C", "H", "H", "H", "H", "H", "H", "H", "H", "G", "F"],
    ["C", "B", "K", "K", "B", "K", "K", "H", "H", "H", "F"],
    ["G", "K", "J", "K", "K", "K", "K", "K", "K", "K", "D"],
    ["G", "K", "J", "K", "K", "K", "K", "H", "K", "K", "F"],
    ["C", "K", "K", "J", "K", "K", "K", "K", "K", "K", "E"],
    ["D", "K", "I", "J", "K", "K", "K", "H", "K", "K", "E"],
    ["E", "K", "I", "K", "K", "K", "K", "K", "K", "K", "C"],
    ["D", "K", "K", "J", "K", "K", "K", "K", "K", "K", "G"],
    ["D", "D", "D", "D", "D", "D", "F", "E", "E", "E", "E"],
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
