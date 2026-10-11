import {
  anakiwa,
  atomicTangerine,
  bittersweet,
  emerald,
  halfBaked,
  lightOrchid,
  macNCheese,
  nomad,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/656",
  size: 11,
  colorRegions: [
    ["B", "B", "E", "E", "E", "J", "J", "A", "A", "J", "J"],
    ["B", "E", "E", "F", "F", "I", "I", "F", "F", "A", "J"],
    ["B", "E", "A", "A", "F", "I", "I", "F", "A", "A", "A"],
    ["E", "E", "A", "A", "F", "F", "I", "F", "A", "H", "H"],
    ["E", "A", "A", "K", "F", "F", "F", "F", "K", "H", "H"],
    ["A", "A", "H", "K", "K", "F", "F", "K", "K", "H", "H"],
    ["H", "H", "H", "H", "K", "D", "K", "H", "H", "H", "H"],
    ["H", "G", "K", "H", "H", "D", "K", "H", "K", "K", "H"],
    ["G", "G", "G", "K", "K", "D", "K", "H", "K", "H", "H"],
    ["G", "G", "K", "K", "K", "H", "D", "K", "H", "K", "C"],
    ["G", "G", "G", "K", "G", "D", "K", "K", "K", "C", "C"],
  ],
  regionColors: {
    A: anakiwa,
    B: lightOrchid,
    C: nomad,
    D: emerald,
    E: saharaSand,
    F: bittersweet,
    G: macNCheese,
    H: halfBaked,
    I: atomicTangerine,
    J: white,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
