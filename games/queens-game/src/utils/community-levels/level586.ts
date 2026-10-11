import {
  anakiwa,
  atomicTangerine,
  bittersweet,
  emerald,
  lightGreen,
  lightOrchid,
  lightWisteria,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/586",
  size: 9,
  colorRegions: [
    ["H", "H", "H", "H", "H", "H", "H", "H", "H"],
    ["H", "A", "A", "A", "F", "F", "F", "E", "E"],
    ["H", "A", "F", "F", "F", "F", "F", "F", "E"],
    ["H", "A", "G", "G", "G", "I", "I", "F", "F"],
    ["H", "G", "G", "I", "I", "I", "I", "F", "F"],
    ["H", "G", "G", "I", "I", "I", "I", "F", "C"],
    ["H", "B", "G", "I", "I", "D", "I", "F", "C"],
    ["H", "B", "G", "G", "I", "I", "I", "F", "C"],
    ["H", "B", "B", "B", "I", "I", "I", "C", "C"],
  ],
  regionColors: {
    A: lightWisteria,
    B: atomicTangerine,
    C: anakiwa,
    D: lightGreen,
    E: white,
    F: bittersweet,
    G: saharaSand,
    H: emerald,
    I: lightOrchid,
  },
  solutionsCount: 1,
  createdBy: "Kestreliah",
  creatorLink: "",
};

export default level;
