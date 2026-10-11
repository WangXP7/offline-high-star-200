import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  halfBaked,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/737",
  size: 10,
  colorRegions: [
    ["C", "C", "B", "B", "G", "G", "B", "B", "D", "D"],
    ["C", "C", "C", "C", "J", "J", "D", "D", "D", "D"],
    ["F", "E", "C", "C", "A", "A", "D", "D", "E", "F"],
    ["C", "F", "E", "C", "J", "J", "D", "E", "F", "D"],
    ["C", "C", "G", "G", "A", "A", "G", "G", "D", "D"],
    ["C", "C", "G", "A", "G", "G", "A", "G", "D", "D"],
    ["C", "C", "A", "G", "H", "H", "G", "A", "D", "D"],
    ["C", "F", "C", "C", "I", "H", "D", "D", "F", "F"],
    ["F", "C", "C", "C", "I", "I", "D", "D", "D", "F"],
    ["A", "G", "A", "J", "J", "J", "J", "A", "G", "A"],
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
    J: halfBaked,
  },
  solutionsCount: 1,
  createdBy: "Victor Bandoiu",
  creatorLink: "https://www.instagram.com/victorban72/",
};

export default level;
