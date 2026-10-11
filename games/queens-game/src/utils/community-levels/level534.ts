import {
  altoMain,
  atomicTangerine,
  bittersweet,
  celadon,
  emerald,
  lavenderRose,
  lightOrchid,
  macNCheese,
  nomad,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/534",
  size: 11,
  colorRegions: [
    ["J", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
    ["J", "F", "F", "F", "F", "C", "F", "F", "B", "F", "A"],
    ["J", "J", "F", "F", "F", "C", "C", "B", "B", "B", "A"],
    ["J", "F", "F", "F", "F", "F", "C", "C", "B", "F", "A"],
    ["J", "F", "F", "F", "F", "C", "C", "F", "B", "I", "A"],
    ["D", "D", "D", "F", "F", "F", "F", "F", "B", "F", "A"],
    ["K", "K", "D", "D", "F", "C", "C", "H", "F", "F", "A"],
    ["K", "F", "F", "F", "F", "C", "C", "H", "H", "F", "A"],
    ["K", "E", "G", "G", "G", "G", "C", "H", "H", "H", "A"],
    ["K", "E", "E", "F", "G", "C", "C", "H", "H", "H", "A"],
    ["K", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F"],
  ],
  regionColors: {
    A: white,
    B: macNCheese,
    C: celadon,
    D: altoMain,
    E: bittersweet,
    F: lavenderRose,
    G: nomad,
    H: lightOrchid,
    I: emerald,
    J: turquoiseBlue,
    K: atomicTangerine,
  },
  solutionsCount: 1,
  createdBy: "Magz",
  creatorLink: "",
};

export default level;
