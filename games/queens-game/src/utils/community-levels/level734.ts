import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/734",
  size: 6,
  colorRegions: [
    ["A", "A", "A", "D", "E", "F"],
    ["A", "B", "D", "D", "D", "F"],
    ["A", "B", "C", "F", "F", "F"],
    ["F", "B", "C", "D", "B", "B"],
    ["F", "F", "C", "D", "E", "B"],
    ["F", "D", "D", "D", "D", "F"],
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
  createdBy: "VictorBandoiu",
  creatorLink: "https://www.instagram.com/victorban72/",
};

export default level;
