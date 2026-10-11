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
  path: "/community-level/529",
  size: 10,
  colorRegions: [
    ["E", "E", "E", "E", "C", "B", "A", "A", "A", "A"],
    ["J", "J", "E", "I", "B", "I", "G", "A", "H", "H"],
    ["E", "J", "I", "I", "I", "B", "G", "A", "H", "A"],
    ["E", "E", "I", "I", "B", "G", "G", "G", "A", "A"],
    ["E", "E", "I", "I", "I", "B", "G", "G", "H", "A"],
    ["E", "J", "I", "I", "B", "G", "G", "G", "H", "H"],
    ["J", "F", "I", "I", "I", "B", "G", "G", "D", "H"],
    ["F", "F", "I", "I", "B", "G", "G", "G", "D", "D"],
    ["F", "I", "I", "I", "I", "B", "G", "G", "G", "G"],
    ["I", "I", "I", "I", "B", "G", "G", "G", "G", "G"],
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
  createdBy: "MagicalMelancholy",
  creatorLink: "",
};

export default level;
