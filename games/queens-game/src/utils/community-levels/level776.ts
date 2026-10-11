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
  path: "/community-level/776",
  size: 10,
  colorRegions: [
    ["E", "E", "E", "E", "G", "G", "G", "G", "G", "G"],
    ["E", "E", "I", "B", "D", "D", "D", "D", "G", "G"],
    ["E", "E", "B", "B", "D", "D", "D", "F", "F", "F"],
    ["B", "E", "E", "B", "D", "D", "F", "F", "F", "F"],
    ["B", "B", "B", "B", "D", "D", "D", "F", "F", "F"],
    ["B", "B", "B", "B", "B", "D", "F", "F", "C", "C"],
    ["A", "A", "A", "A", "A", "F", "F", "F", "C", "C"],
    ["A", "J", "C", "C", "C", "C", "C", "C", "C", "H"],
    ["A", "A", "H", "H", "H", "H", "H", "C", "H", "H"],
    ["A", "A", "A", "H", "H", "H", "H", "H", "H", "H"],
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
  createdBy: "Ade",
  creatorLink: "",
};

export default level;
