import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/736",
  size: 9,
  colorRegions: [
    ["F", "I", "I", "I", "I", "I", "I", "I", "I"],
    ["F", "I", "H", "H", "H", "H", "H", "H", "I"],
    ["F", "H", "H", "H", "F", "H", "H", "I", "I"],
    ["F", "F", "F", "F", "F", "H", "H", "G", "I"],
    ["F", "F", "E", "E", "E", "E", "G", "G", "D"],
    ["D", "D", "D", "D", "E", "E", "G", "G", "D"],
    ["A", "C", "C", "D", "E", "E", "G", "G", "D"],
    ["A", "C", "B", "D", "D", "D", "D", "D", "D"],
    ["C", "C", "B", "B", "D", "D", "D", "D", "D"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
    I: lightOrchid,
  },
  solutionsCount: 1,
  createdBy: "VictorBandoiu",
  creatorLink: "https://www.instagram.com/victorban72/",
};

export default level;
