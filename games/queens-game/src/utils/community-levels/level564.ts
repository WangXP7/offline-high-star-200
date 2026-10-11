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
  path: "/community-level/564",
  size: 8,
  colorRegions: [
    ["C", "C", "C", "G", "G", "G", "G", "G"],
    ["C", "B", "B", "B", "B", "B", "B", "G"],
    ["D", "D", "H", "B", "H", "A", "A", "G"],
    ["H", "G", "G", "C", "H", "A", "H", "G"],
    ["G", "A", "F", "F", "F", "A", "H", "G"],
    ["G", "B", "F", "A", "F", "B", "B", "G"],
    ["D", "D", "F", "B", "B", "H", "H", "G"],
    ["E", "D", "F", "G", "D", "A", "A", "A"],
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
  createdBy: "K dawg",
  creatorLink: "",
};

export default level;
