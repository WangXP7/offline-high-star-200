import {
  anakiwa,
  atomicTangerine,
  bittersweet,
  celadon,
  lightOrchid,
  lightWisteria,
  macNCheese,
  nomad,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/522",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "B", "B", "B", "B", "B", "B", "B", "B"],
    ["A", "B", "A", "B", "K", "B", "K", "K", "K", "B", "B"],
    ["A", "B", "A", "B", "K", "K", "K", "K", "G", "B", "B"],
    ["A", "B", "B", "B", "K", "K", "K", "G", "G", "G", "B"],
    ["A", "A", "B", "E", "E", "K", "K", "G", "G", "I", "B"],
    ["A", "A", "B", "E", "E", "E", "K", "G", "G", "I", "B"],
    ["A", "A", "B", "E", "E", "E", "F", "G", "I", "I", "J"],
    ["A", "A", "B", "B", "B", "E", "F", "G", "I", "I", "J"],
    ["A", "C", "C", "B", "B", "E", "F", "G", "I", "I", "J"],
    ["A", "C", "C", "D", "D", "E", "F", "G", "H", "H", "J"],
    ["A", "C", "C", "D", "D", "E", "F", "G", "G", "H", "J"],
  ],
  regionColors: {
    A: lightWisteria,
    B: white,
    C: anakiwa,
    D: celadon,
    E: macNCheese,
    F: bittersweet,
    G: saharaSand,
    H: atomicTangerine,
    I: lightOrchid,
    J: nomad,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "Streeb",
  creatorLink: "",
};

export default level;
