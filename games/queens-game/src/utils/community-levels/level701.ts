import {
  atomicTangerine,
  celadon,
  chardonnay,
  coldPurple,
  halfBaked,
  lightOrchid,
  lightWisteria,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/701",
  size: 8,
  colorRegions: [
    ["E", "E", "G", "G", "G", "H", "A", "C"],
    ["E", "F", "H", "G", "H", "D", "B", "A"],
    ["G", "F", "F", "G", "H", "B", "D", "G"],
    ["G", "G", "G", "H", "D", "G", "G", "H"],
    ["G", "H", "H", "D", "G", "H", "H", "H"],
    ["H", "D", "B", "G", "H", "E", "G", "H"],
    ["C", "B", "D", "G", "H", "E", "E", "F"],
    ["A", "C", "G", "H", "H", "H", "F", "F"],
  ],
  regionColors: {
    A: saharaSand,
    B: chardonnay,
    C: lightOrchid,
    D: atomicTangerine,
    E: lightWisteria,
    F: coldPurple,
    G: halfBaked,
    H: celadon,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
