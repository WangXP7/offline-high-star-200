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
  path: "/community-level/543",
  size: 7,
  colorRegions: [
    ["G", "F", "F", "F", "F", "F", "F"],
    ["E", "E", "E", "E", "E", "E", "F"],
    ["E", "E", "D", "D", "D", "D", "D"],
    ["C", "C", "D", "D", "D", "D", "D"],
    ["C", "C", "C", "C", "C", "C", "C"],
    ["B", "B", "B", "B", "B", "B", "B"],
    ["A", "A", "A", "A", "B", "A", "A"],
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
  createdBy: "MidoZ",
  creatorLink: "",
};

export default level;
