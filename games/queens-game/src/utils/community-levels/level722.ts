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
  path: "/community-level/722",
  size: 10,
  colorRegions: [
    ["I", "I", "I", "I", "E", "E", "E", "E", "E", "E"],
    ["I", "H", "H", "I", "D", "D", "E", "J", "E", "E"],
    ["I", "H", "H", "B", "D", "D", "B", "J", "C", "E"],
    ["I", "H", "H", "B", "F", "F", "B", "D", "C", "C"],
    ["A", "A", "H", "J", "J", "D", "D", "D", "B", "B"],
    ["I", "H", "H", "A", "D", "D", "A", "F", "C", "I"],
    ["H", "H", "H", "A", "D", "D", "A", "F", "I", "I"],
    ["C", "C", "C", "C", "D", "D", "D", "D", "C", "C"],
    ["C", "C", "C", "C", "G", "G", "C", "G", "C", "C"],
    ["I", "H", "H", "C", "C", "C", "C", "G", "I", "I"],
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
