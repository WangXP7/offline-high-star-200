import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/689",
  size: 8,
  colorRegions: [
    ["E", "E", "E", "B", "B", "E", "F", "F"],
    ["E", "H", "A", "H", "D", "E", "A", "D"],
    ["A", "A", "E", "E", "E", "G", "E", "E"],
    ["H", "E", "C", "H", "H", "D", "E", "H"],
    ["H", "D", "D", "D", "H", "C", "E", "H"],
    ["E", "E", "G", "E", "E", "E", "A", "A"],
    ["D", "F", "E", "D", "H", "A", "H", "E"],
    ["F", "F", "E", "B", "B", "E", "E", "E"],
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
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
