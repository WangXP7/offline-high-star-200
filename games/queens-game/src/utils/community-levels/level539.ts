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
  path: "/community-level/539",
  size: 7,
  colorRegions: [
    ["E", "E", "E", "E", "C", "C", "C"],
    ["E", "E", "A", "A", "A", "A", "C"],
    ["E", "E", "D", "A", "C", "C", "C"],
    ["B", "B", "D", "A", "A", "C", "C"],
    ["G", "B", "D", "F", "A", "A", "C"],
    ["G", "B", "D", "F", "F", "C", "C"],
    ["B", "B", "F", "F", "F", "F", "F"],
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
  createdBy: "ST first ever",
  creatorLink: "",
};

export default level;
