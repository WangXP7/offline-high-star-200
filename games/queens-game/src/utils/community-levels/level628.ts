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
  path: "/community-level/628",
  size: 10,
  colorRegions: [
    ["A", "A", "J", "J", "C", "J", "I", "H", "J", "B"],
    ["A", "A", "D", "J", "J", "J", "J", "J", "E", "J"],
    ["C", "D", "G", "F", "J", "J", "J", "J", "J", "J"],
    ["E", "J", "F", "I", "G", "J", "J", "J", "J", "J"],
    ["C", "J", "J", "G", "I", "H", "J", "J", "J", "J"],
    ["C", "C", "J", "J", "H", "I", "G", "J", "J", "J"],
    ["E", "J", "C", "J", "J", "G", "I", "F", "J", "J"],
    ["E", "J", "J", "C", "J", "J", "F", "G", "D", "J"],
    ["E", "E", "J", "J", "C", "J", "J", "D", "C", "I"],
    ["B", "C", "C", "C", "C", "C", "C", "C", "C", "B"],
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
  createdBy: "jnielson616",
  creatorLink: "https://github.com/jnielson616",
};

export default level;
