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
  path: "/community-level/576",
  size: 10,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "A", "A", "E"],
    ["A", "B", "A", "A", "A", "A", "A", "E", "E", "E"],
    ["A", "B", "B", "A", "A", "A", "C", "E", "E", "D"],
    ["A", "A", "B", "A", "A", "C", "C", "E", "E", "D"],
    ["A", "A", "A", "A", "A", "J", "J", "E", "J", "D"],
    ["A", "A", "A", "A", "A", "A", "J", "J", "J", "D"],
    ["A", "A", "A", "I", "I", "J", "J", "J", "J", "D"],
    ["A", "A", "I", "I", "I", "J", "F", "H", "J", "D"],
    ["A", "A", "G", "I", "I", "F", "F", "H", "D", "D"],
    ["G", "G", "G", "G", "F", "F", "F", "H", "H", "H"],
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
  createdBy: "Théologie",
  creatorLink: "",
};

export default level;
