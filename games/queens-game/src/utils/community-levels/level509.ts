import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/509",
  size: 6,
  colorRegions: [
    ["A", "A", "D", "E", "E", "E"],
    ["A", "B", "D", "E", "E", "E"],
    ["B", "B", "D", "D", "F", "F"],
    ["B", "C", "C", "D", "F", "F"],
    ["C", "C", "D", "D", "F", "F"],
    ["C", "C", "D", "D", "F", "F"],
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
  createdBy: "profandrebraga",
  creatorLink: "",
};

export default level;
