import {
  altoMain,
  anakiwa,
  atomicTangerine,
  bittersweet,
  celadon,
  chardonnay,
  emerald,
  lightOrchid,
  lightWisteria,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/524",
  size: 11,
  colorRegions: [
    ["H", "H", "H", "I", "H", "H", "A", "A", "A", "A", "F"],
    ["H", "H", "H", "H", "H", "H", "H", "A", "A", "A", "F"],
    ["H", "H", "H", "H", "H", "H", "H", "H", "A", "A", "F"],
    ["H", "H", "H", "H", "H", "H", "H", "H", "F", "F", "F"],
    ["H", "G", "G", "H", "H", "H", "C", "F", "F", "F", "F"],
    ["G", "G", "G", "G", "G", "H", "C", "F", "F", "F", "F"],
    ["J", "J", "J", "E", "E", "E", "B", "F", "F", "F", "F"],
    ["J", "D", "K", "B", "B", "E", "B", "B", "F", "F", "F"],
    ["D", "D", "K", "B", "B", "B", "B", "B", "B", "F", "F"],
    ["D", "B", "B", "B", "B", "B", "B", "B", "B", "F", "F"],
    ["B", "B", "B", "B", "B", "B", "B", "B", "B", "F", "F"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: altoMain,
    E: white,
    F: celadon,
    G: lightOrchid,
    H: atomicTangerine,
    I: saharaSand,
    J: emerald,
    K: bittersweet,
  },
  solutionsCount: 1,
  createdBy: "Streeb",
  creatorLink: "",
};

export default level;
