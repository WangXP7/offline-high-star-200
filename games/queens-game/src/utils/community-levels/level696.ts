import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/696",
  size: 6,
  colorRegions: [
    ["A", "A", "B", "B", "B", "B"],
    ["A", "A", "C", "C", "C", "B"],
    ["A", "A", "C", "D", "D", "B"],
    ["A", "A", "B", "B", "B", "B"],
    ["E", "E", "E", "E", "F", "F"],
    ["E", "F", "F", "F", "F", "F"],
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
  createdBy: "Kyle Young",
  creatorLink: "",
};

export default level;
