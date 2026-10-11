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
  path: "/community-level/698",
  size: 9,
  colorRegions: [
    ["A", "A", "A", "A", "I", "I", "F", "F", "B"],
    ["E", "E", "I", "I", "I", "I", "I", "F", "B"],
    ["E", "I", "I", "I", "I", "I", "F", "F", "B"],
    ["E", "I", "I", "I", "I", "I", "I", "F", "B"],
    ["I", "I", "I", "I", "I", "I", "I", "I", "I"],
    ["D", "G", "I", "I", "I", "I", "I", "I", "H"],
    ["D", "G", "G", "I", "I", "I", "I", "I", "H"],
    ["D", "G", "I", "I", "I", "C", "H", "H", "H"],
    ["D", "G", "G", "I", "I", "C", "C", "C", "C"],
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
  createdBy: "MazeBoy",
  creatorLink: "https://muvicadomindware.com",
};

export default level;
