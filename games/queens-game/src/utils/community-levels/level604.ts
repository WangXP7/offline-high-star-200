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
  path: "/community-level/604",
  size: 9,
  colorRegions: [
    ["E", "E", "G", "E", "E", "E", "I", "E", "E"],
    ["E", "E", "G", "E", "A", "B", "I", "E", "E"],
    ["G", "G", "G", "E", "H", "E", "I", "H", "H"],
    ["F", "F", "F", "E", "H", "H", "I", "H", "E"],
    ["E", "E", "F", "E", "E", "E", "I", "I", "E"],
    ["E", "A", "F", "E", "A", "B", "E", "I", "B"],
    ["E", "D", "F", "E", "D", "C", "E", "I", "C"],
    ["I", "I", "I", "I", "I", "I", "I", "I", "E"],
    ["E", "E", "E", "E", "D", "C", "E", "E", "E"],
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
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
