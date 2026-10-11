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
  path: "/community-level/690",
  size: 9,
  colorRegions: [
    ["E", "E", "B", "B", "A", "I", "C", "C", "C"],
    ["H", "H", "H", "H", "H", "I", "A", "A", "C"],
    ["E", "H", "H", "I", "H", "I", "A", "A", "C"],
    ["H", "H", "F", "F", "B", "B", "I", "I", "I"],
    ["D", "H", "A", "F", "F", "B", "H", "H", "B"],
    ["G", "G", "H", "A", "F", "F", "I", "H", "B"],
    ["H", "H", "H", "H", "A", "F", "H", "H", "B"],
    ["F", "H", "H", "G", "H", "H", "H", "H", "D"],
    ["F", "F", "H", "G", "E", "H", "D", "H", "D"],
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
