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
  path: "/community-level/579",
  size: 9,
  colorRegions: [
    ["B", "B", "B", "B", "B", "B", "B", "F", "F"],
    ["D", "D", "D", "B", "D", "D", "D", "F", "F"],
    ["A", "D", "D", "D", "D", "D", "D", "F", "F"],
    ["D", "D", "F", "F", "F", "F", "F", "F", "F"],
    ["D", "D", "E", "F", "F", "F", "F", "F", "F"],
    ["D", "D", "E", "C", "C", "C", "C", "F", "F"],
    ["D", "I", "E", "C", "C", "G", "C", "F", "F"],
    ["D", "I", "E", "C", "C", "G", "F", "F", "F"],
    ["D", "I", "E", "C", "C", "F", "F", "F", "H"],
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
  createdBy: "mateuszb0k",
  creatorLink: "https://github.com/mateuszb0k",
};

export default level;
