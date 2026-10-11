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
  path: "/community-level/555",
  size: 9,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["A", "F", "D", "D", "D", "G", "C", "A", "G"],
    ["A", "D", "F", "D", "D", "C", "C", "G", "C"],
    ["A", "D", "D", "F", "D", "C", "G", "A", "C"],
    ["A", "D", "D", "D", "F", "G", "C", "A", "C"],
    ["A", "H", "E", "E", "H", "I", "B", "A", "B"],
    ["A", "E", "E", "H", "E", "B", "I", "A", "B"],
    ["A", "E", "H", "E", "E", "B", "B", "I", "B"],
    ["A", "A", "A", "A", "A", "A", "A", "A", "I"],
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
  createdBy: "tn_brggn",
  creatorLink: "",
};

export default level;
