import {
  altoMain,
  anakiwa,
  celadon,
  chardonnay,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/547",
  size: 8,
  colorRegions: [
    ["F", "F", "C", "C", "C", "A", "A", "A"],
    ["F", "C", "C", "C", "D", "C", "C", "A"],
    ["C", "C", "C", "D", "D", "C", "C", "C"],
    ["G", "G", "G", "G", "D", "C", "D", "G"],
    ["B", "G", "D", "G", "D", "D", "D", "G"],
    ["B", "H", "D", "D", "D", "G", "B", "G"],
    ["H", "H", "H", "G", "D", "G", "B", "G"],
    ["H", "G", "G", "G", "D", "E", "E", "E"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: lightOrchid,
    G: saharaSand,
    H: nomad,
  },
  solutionsCount: 1,
  createdBy: "SEROAPP",
  creatorLink: "",
};

export default level;
