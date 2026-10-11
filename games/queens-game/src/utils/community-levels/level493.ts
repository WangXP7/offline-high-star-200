import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/493",
  size: 8,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A"],
    ["A", "D", "D", "G", "G", "G", "G", "A"],
    ["A", "D", "D", "D", "H", "H", "G", "A"],
    ["D", "D", "D", "D", "D", "H", "H", "A"],
    ["A", "C", "D", "C", "C", "C", "B", "A"],
    ["A", "C", "C", "C", "E", "C", "B", "A"],
    ["A", "F", "C", "E", "E", "B", "B", "A"],
    ["A", "F", "A", "A", "A", "A", "A", "A"],
  ],
  regionColors: {
    A: lightWisteria,
    B: lightOrchid,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
  },
  solutionsCount: 1,
  createdBy: "brusli",
  creatorLink: "",
};

export default level;
