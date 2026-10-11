import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/661",
  size: 6,
  colorRegions: [
    ["A", "A", "B", "C", "D", "E"],
    ["B", "B", "B", "C", "E", "E"],
    ["C", "C", "B", "C", "D", "E"],
    ["C", "C", "D", "C", "D", "E"],
    ["E", "E", "E", "E", "E", "E"],
    ["A", "E", "F", "F", "F", "E"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
  },
  solutionsCount: 1,
  createdBy: "NemanJah",
  creatorLink: "",
};

export default level;
