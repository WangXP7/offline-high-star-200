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
  path: "/community-level/678",
  size: 11,
  colorRegions: [
    ["J", "F", "F", "F", "E", "F", "B", "F", "F", "F", "F"],
    ["K", "H", "B", "B", "A", "G", "G", "C", "K", "K", "K"],
    ["I", "H", "B", "B", "A", "G", "G", "K", "I", "K", "K"],
    ["K", "E", "D", "G", "F", "G", "A", "K", "K", "E", "K"],
    ["K", "K", "D", "K", "A", "E", "A", "K", "K", "K", "K"],
    ["D", "D", "K", "K", "A", "A", "A", "K", "K", "D", "D"],
    ["K", "K", "K", "K", "A", "E", "A", "K", "D", "K", "K"],
    ["K", "E", "K", "K", "A", "G", "F", "G", "D", "E", "K"],
    ["K", "K", "I", "K", "G", "G", "A", "B", "B", "H", "I"],
    ["K", "K", "K", "C", "G", "G", "A", "B", "B", "H", "K"],
    ["F", "F", "F", "F", "A", "F", "E", "F", "F", "F", "J"],
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
