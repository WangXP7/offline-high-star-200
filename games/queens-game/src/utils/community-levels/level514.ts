import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/514",
  size: 9,
  colorRegions: [
    ["E", "I", "I", "I", "H", "H", "G", "F", "A"],
    ["I", "I", "I", "H", "H", "G", "G", "A", "A"],
    ["I", "I", "H", "H", "G", "G", "A", "A", "B"],
    ["I", "H", "H", "G", "G", "A", "A", "B", "B"],
    ["H", "H", "G", "G", "A", "A", "B", "B", "C"],
    ["H", "G", "G", "A", "A", "B", "B", "C", "C"],
    ["G", "G", "A", "A", "B", "B", "C", "C", "F"],
    ["G", "A", "A", "B", "B", "C", "C", "E", "D"],
    ["A", "A", "B", "B", "C", "C", "F", "E", "D"],
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
  },
  solutionsCount: 1,
  createdBy: "Willm32",
  creatorLink: "",
};

export default level;
