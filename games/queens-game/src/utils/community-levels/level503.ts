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
  path: "/community-level/503",
  size: 10,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["A", "A", "A", "D", "C", "C", "C", "A", "A", "B"],
    ["D", "D", "D", "D", "J", "J", "J", "J", "A", "B"],
    ["D", "E", "E", "D", "J", "F", "F", "J", "A", "B"],
    ["D", "D", "E", "D", "J", "F", "J", "J", "A", "B"],
    ["G", "D", "D", "D", "J", "J", "J", "A", "A", "B"],
    ["G", "G", "G", "H", "H", "H", "H", "H", "A", "B"],
    ["G", "G", "G", "G", "H", "I", "I", "H", "A", "B"],
    ["G", "G", "G", "G", "H", "I", "H", "H", "A", "B"],
    ["G", "G", "G", "G", "H", "H", "H", "A", "A", "A"],
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
  createdBy: "EricPHathaway",
  creatorLink: "https://github.com/EricPHathaway",
};

export default level;
