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
  path: "/community-level/531",
  size: 9,
  colorRegions: [
    ["I", "I", "I", "I", "D", "D", "D", "D", "D"],
    ["I", "I", "I", "I", "I", "D", "D", "D", "C"],
    ["I", "I", "I", "I", "I", "I", "I", "C", "C"],
    ["A", "I", "I", "I", "I", "I", "I", "C", "C"],
    ["A", "A", "A", "A", "A", "A", "E", "E", "E"],
    ["A", "A", "A", "A", "A", "A", "F", "E", "E"],
    ["A", "A", "G", "G", "G", "F", "F", "F", "F"],
    ["G", "G", "G", "G", "G", "B", "B", "B", "B"],
    ["H", "H", "G", "G", "B", "B", "B", "B", "B"],
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
  createdBy: "Philey",
  creatorLink: "",
};

export default level;
