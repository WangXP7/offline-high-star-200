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
  path: "/community-level/619",
  size: 9,
  colorRegions: [
    ["I", "I", "I", "I", "D", "H", "H", "I", "I"],
    ["I", "D", "I", "B", "B", "H", "I", "I", "I"],
    ["I", "I", "D", "I", "B", "H", "I", "I", "I"],
    ["I", "B", "I", "D", "B", "E", "E", "I", "I"],
    ["D", "B", "B", "B", "A", "A", "E", "I", "I"],
    ["I", "I", "I", "F", "A", "D", "E", "E", "I"],
    ["I", "I", "I", "F", "F", "F", "G", "I", "I"],
    ["I", "C", "C", "C", "C", "F", "I", "G", "I"],
    ["C", "C", "C", "H", "H", "H", "H", "H", "G"],
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
  createdBy: "Ja-Nice",
  creatorLink: "",
};

export default level;
