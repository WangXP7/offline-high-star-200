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
  path: "/community-level/511",
  size: 9,
  colorRegions: [
    ["B", "B", "B", "A", "A", "E", "E", "E", "E"],
    ["C", "B", "C", "A", "A", "A", "A", "A", "E"],
    ["C", "B", "C", "D", "D", "A", "E", "E", "E"],
    ["C", "C", "C", "C", "D", "A", "A", "A", "E"],
    ["C", "H", "C", "D", "D", "F", "F", "A", "E"],
    ["C", "H", "C", "C", "C", "C", "F", "A", "A"],
    ["H", "H", "H", "H", "C", "F", "F", "G", "A"],
    ["H", "C", "C", "C", "C", "C", "C", "G", "G"],
    ["H", "H", "H", "H", "H", "H", "C", "G", "I"],
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
  createdBy: "dcon",
  creatorLink: "https://github.com/DConquit",
};

export default level;
