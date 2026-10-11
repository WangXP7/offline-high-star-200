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
  path: "/community-level/703",
  size: 9,
  colorRegions: [
    ["A", "C", "A", "E", "G", "C", "C", "C", "D"],
    ["A", "E", "C", "C", "G", "C", "C", "C", "G"],
    ["A", "E", "C", "A", "G", "C", "C", "G", "D"],
    ["E", "E", "E", "C", "G", "C", "C", "D", "D"],
    ["C", "C", "C", "C", "C", "D", "C", "G", "D"],
    ["I", "H", "C", "I", "C", "D", "D", "D", "F"],
    ["B", "H", "D", "C", "C", "D", "D", "C", "F"],
    ["D", "D", "I", "B", "F", "D", "C", "F", "G"],
    ["B", "H", "H", "I", "H", "F", "F", "F", "F"],
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
