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
  path: "/community-level/595",
  size: 8,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "B"],
    ["A", "C", "C", "C", "C", "C", "C", "B"],
    ["A", "C", "C", "C", "C", "C", "F", "B"],
    ["A", "D", "D", "D", "F", "F", "F", "B"],
    ["A", "D", "D", "D", "F", "H", "F", "B"],
    ["A", "E", "E", "G", "H", "H", "F", "B"],
    ["A", "G", "G", "G", "H", "H", "H", "B"],
    ["B", "B", "B", "B", "B", "B", "B", "B"],
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
  createdBy: "Warcl0wn",
  creatorLink: "https://github.com/warcl0wn",
};

export default level;
