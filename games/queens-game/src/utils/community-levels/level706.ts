import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/706",
  size: 6,
  colorRegions: [
    ["F", "F", "A", "A", "B", "C"],
    ["F", "A", "A", "B", "B", "C"],
    ["F", "A", "B", "B", "C", "C"],
    ["E", "A", "B", "B", "C", "D"],
    ["E", "A", "A", "B", "B", "D"],
    ["E", "E", "A", "A", "B", "D"],
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
