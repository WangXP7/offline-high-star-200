import {
  anakiwa,
  atomicTangerine,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  saharaSand,
  turquoiseBlue,
} from "../colors";

const level = {
  path: "/community-level/694",
  size: 8,
  colorRegions: [
    ["B", "D", "B", "B", "D", "C", "C", "E"],
    ["B", "B", "B", "C", "C", "C", "C", "C"],
    ["B", "B", "C", "C", "H", "C", "C", "C"],
    ["B", "B", "C", "H", "F", "H", "G", "G"],
    ["B", "A", "H", "F", "A", "F", "H", "G"],
    ["B", "A", "G", "H", "F", "H", "D", "G"],
    ["B", "B", "B", "G", "H", "D", "G", "G"],
    ["B", "B", "B", "B", "G", "D", "G", "G"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: saharaSand,
    F: bittersweet,
    G: turquoiseBlue,
    H: atomicTangerine,
  },
  solutionsCount: 1,
  createdBy: "saraa!",
  creatorLink: "",
};

export default level;
