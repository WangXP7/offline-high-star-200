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
  path: "/community-level/567",
  size: 9,
  colorRegions: [
    ["A", "A", "E", "E", "C", "C", "I", "B", "B"],
    ["H", "A", "E", "E", "C", "I", "I", "B", "B"],
    ["H", "A", "E", "C", "C", "C", "G", "B", "B"],
    ["H", "A", "E", "A", "G", "G", "G", "B", "B"],
    ["H", "A", "A", "A", "A", "D", "B", "B", "B"],
    ["H", "A", "A", "A", "D", "D", "B", "B", "B"],
    ["H", "H", "H", "A", "A", "A", "A", "A", "A"],
    ["H", "H", "H", "F", "F", "F", "F", "F", "A"],
    ["H", "F", "F", "F", "F", "F", "F", "A", "A"],
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
  createdBy: "igRo",
  creatorLink: "https://github.com/igRo",
};

export default level;
