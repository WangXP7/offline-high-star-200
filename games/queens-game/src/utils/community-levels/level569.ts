import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/569",
  size: 7,
  colorRegions: [
    ["G", "G", "B", "B", "B", "B", "B"],
    ["G", "G", "G", "B", "B", "D", "B"],
    ["G", "G", "G", "G", "B", "B", "B"],
    ["G", "G", "G", "G", "G", "C", "C"],
    ["A", "A", "A", "A", "C", "C", "C"],
    ["E", "F", "E", "E", "E", "C", "C"],
    ["E", "E", "E", "E", "E", "C", "C"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
  },
  solutionsCount: 1,
  createdBy: "Eiiiluhlopes",
  creatorLink: "",
};

export default level;
