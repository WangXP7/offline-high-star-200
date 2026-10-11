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
  path: "/community-level/635",
  size: 9,
  colorRegions: [
    ["A", "A", "A", "A", "A", "B", "B", "B", "B"],
    ["I", "I", "A", "B", "B", "B", "B", "B", "B"],
    ["I", "I", "A", "B", "B", "B", "B", "B", "B"],
    ["I", "I", "A", "B", "D", "D", "D", "D", "D"],
    ["I", "I", "A", "B", "B", "B", "D", "F", "F"],
    ["A", "A", "A", "A", "A", "E", "D", "F", "F"],
    ["G", "G", "G", "H", "H", "E", "D", "F", "F"],
    ["C", "G", "H", "H", "E", "E", "D", "F", "F"],
    ["C", "C", "C", "H", "D", "D", "D", "D", "D"],
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
  createdBy: "Saqibhussain",
  creatorLink: "",
};

export default level;
