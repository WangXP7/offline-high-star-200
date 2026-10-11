import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/668",
  size: 6,
  colorRegions: [
    ["E", "E", "E", "F", "F", "F"],
    ["E", "E", "E", "E", "F", "F"],
    ["E", "D", "D", "D", "F", "C"],
    ["D", "D", "D", "A", "C", "C"],
    ["D", "D", "A", "A", "C", "B"],
    ["D", "A", "A", "A", "B", "B"],
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
  createdBy: "Lazarus",
  creatorLink: "",
};

export default level;
