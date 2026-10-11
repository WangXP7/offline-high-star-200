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
  path: "/community-level/545",
  size: 8,
  colorRegions: [
    ["H", "H", "H", "D", "D", "D", "D", "E"],
    ["H", "H", "H", "C", "C", "C", "D", "E"],
    ["H", "H", "H", "C", "D", "D", "D", "E"],
    ["H", "H", "H", "C", "D", "E", "D", "E"],
    ["F", "G", "H", "B", "B", "E", "E", "E"],
    ["F", "G", "H", "A", "B", "E", "E", "E"],
    ["F", "H", "H", "A", "B", "E", "E", "E"],
    ["H", "H", "H", "A", "A", "E", "E", "E"],
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
  createdBy: "Sylvia",
  creatorLink: "https://sylvia-barron.de/",
};

export default level;
