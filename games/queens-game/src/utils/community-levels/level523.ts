import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/523",
  size: 6,
  colorRegions: [
    ["A", "A", "C", "D", "F", "F"],
    ["C", "C", "C", "D", "D", "F"],
    ["E", "C", "C", "B", "D", "F"],
    ["E", "E", "D", "B", "D", "F"],
    ["E", "D", "D", "D", "D", "F"],
    ["E", "E", "E", "E", "F", "F"],
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
  createdBy: "Watkins_West",
  creatorLink: "https://github.com/watkins-west",
};

export default level;
