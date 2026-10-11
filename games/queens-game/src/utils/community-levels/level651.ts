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
  path: "/community-level/651",
  size: 8,
  colorRegions: [
    ["B", "B", "A", "A", "G", "G", "E", "E"],
    ["B", "B", "B", "A", "G", "G", "G", "E"],
    ["B", "B", "B", "C", "C", "G", "G", "E"],
    ["C", "C", "C", "C", "C", "C", "E", "E"],
    ["C", "C", "C", "C", "C", "C", "F", "E"],
    ["C", "D", "C", "C", "C", "C", "F", "F"],
    ["E", "E", "E", "E", "E", "H", "F", "F"],
    ["E", "E", "E", "E", "E", "F", "F", "F"],
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
  createdBy: "Mary Magdalene",
  creatorLink: "",
};

export default level;
