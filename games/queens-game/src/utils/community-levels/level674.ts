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
  path: "/community-level/674",
  size: 11,
  colorRegions: [
    ["B", "B", "B", "E", "E", "E", "D", "D", "D", "F", "B"],
    ["B", "K", "G", "K", "K", "K", "K", "H", "A", "K", "F"],
    ["B", "G", "G", "G", "E", "E", "K", "J", "G", "G", "D"],
    ["E", "K", "G", "K", "K", "K", "K", "E", "K", "K", "D"],
    ["E", "K", "E", "K", "A", "K", "K", "J", "K", "K", "I"],
    ["E", "K", "E", "K", "K", "K", "K", "I", "K", "K", "I"],
    ["D", "K", "K", "K", "K", "K", "K", "I", "K", "K", "C"],
    ["D", "H", "J", "E", "J", "I", "I", "H", "H", "H", "C"],
    ["D", "A", "G", "K", "K", "K", "K", "H", "C", "K", "E"],
    ["F", "K", "G", "K", "J", "K", "K", "H", "K", "K", "E"],
    ["B", "F", "D", "D", "I", "I", "C", "C", "E", "E", "E"],
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
