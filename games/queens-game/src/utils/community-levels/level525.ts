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
  path: "/community-level/525",
  size: 9,
  colorRegions: [
    ["A", "A", "A", "A", "A", "A", "A", "B", "B"],
    ["D", "D", "C", "A", "C", "A", "A", "A", "A"],
    ["D", "D", "C", "C", "C", "C", "E", "E", "E"],
    ["F", "D", "F", "F", "C", "C", "E", "G", "E"],
    ["F", "D", "D", "F", "C", "G", "E", "G", "E"],
    ["F", "D", "D", "F", "H", "G", "G", "G", "E"],
    ["F", "F", "F", "F", "H", "H", "G", "H", "I"],
    ["F", "F", "F", "H", "F", "H", "H", "H", "H"],
    ["F", "F", "H", "H", "H", "F", "H", "I", "I"],
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
  createdBy: "braindeadJohn",
  creatorLink: "",
};

export default level;
