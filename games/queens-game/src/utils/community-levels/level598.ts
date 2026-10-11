import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  emerald,
  halfBaked,
  lightGreen,
  lightOrchid,
  lightWisteria,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/598",
  size: 11,
  colorRegions: [
    ["A", "A", "G", "G", "K", "K", "K", "J", "F", "F", "F"],
    ["A", "G", "G", "G", "K", "K", "K", "J", "J", "J", "F"],
    ["E", "G", "G", "G", "G", "K", "K", "J", "J", "J", "F"],
    ["E", "E", "G", "G", "G", "K", "J", "J", "J", "J", "F"],
    ["E", "E", "H", "H", "D", "D", "D", "J", "I", "I", "I"],
    ["E", "E", "E", "H", "D", "D", "D", "D", "I", "I", "I"],
    ["E", "H", "H", "H", "D", "D", "D", "D", "I", "I", "I"],
    ["C", "H", "H", "D", "D", "D", "D", "D", "D", "I", "I"],
    ["C", "H", "H", "D", "D", "D", "D", "D", "D", "I", "I"],
    ["C", "H", "H", "D", "D", "D", "D", "D", "D", "I", "B"],
    ["C", "C", "C", "D", "D", "D", "D", "D", "D", "B", "B"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: lightGreen,
    I: lightOrchid,
    J: halfBaked,
    K: emerald,
  },
  solutionsCount: 1,
  createdBy: "Lea",
  creatorLink: "",
};

export default level;
