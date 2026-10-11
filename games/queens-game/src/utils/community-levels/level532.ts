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
  path: "/community-level/532",
  size: 8,
  colorRegions: [
    ["E", "E", "E", "E", "H", "H", "H", "H"],
    ["E", "E", "E", "E", "H", "B", "B", "H"],
    ["E", "E", "E", "E", "H", "B", "H", "H"],
    ["B", "B", "B", "B", "B", "B", "D", "D"],
    ["G", "G", "G", "G", "C", "D", "D", "D"],
    ["G", "C", "C", "C", "C", "F", "F", "F"],
    ["G", "C", "F", "F", "C", "F", "A", "A"],
    ["G", "G", "G", "F", "F", "F", "A", "A"],
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
  createdBy: "Yer Boi",
  creatorLink: "",
};

export default level;
