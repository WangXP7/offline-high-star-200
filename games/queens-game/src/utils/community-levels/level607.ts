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
  path: "/community-level/607",
  size: 10,
  colorRegions: [
    ["I", "I", "J", "I", "I", "F", "H", "H", "I", "I"],
    ["J", "I", "B", "H", "C", "F", "A", "I", "H", "I"],
    ["J", "B", "B", "B", "F", "A", "G", "F", "I", "I"],
    ["I", "B", "A", "I", "G", "F", "G", "F", "G", "I"],
    ["B", "B", "B", "D", "A", "G", "G", "G", "G", "I"],
    ["I", "J", "B", "D", "D", "D", "H", "G", "I", "I"],
    ["J", "E", "J", "E", "D", "A", "H", "G", "E", "E"],
    ["I", "I", "B", "E", "D", "E", "H", "I", "I", "I"],
    ["J", "E", "J", "E", "I", "E", "H", "G", "I", "I"],
    ["C", "C", "C", "C", "D", "D", "H", "H", "C", "C"],
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
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
