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
  path: "/community-level/536",
  size: 9,
  colorRegions: [
    ["A", "B", "B", "B", "B", "I", "I", "I", "I"],
    ["A", "G", "G", "G", "B", "B", "B", "B", "F"],
    ["A", "G", "G", "G", "G", "D", "D", "F", "F"],
    ["A", "C", "C", "C", "C", "D", "D", "F", "F"],
    ["A", "A", "A", "A", "C", "C", "C", "C", "F"],
    ["E", "E", "A", "A", "A", "A", "F", "F", "F"],
    ["E", "H", "H", "H", "H", "A", "F", "F", "F"],
    ["E", "E", "E", "E", "H", "H", "H", "H", "F"],
    ["E", "E", "E", "E", "E", "E", "E", "E", "E"],
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
  createdBy: "mia",
  creatorLink: "",
};

export default level;
