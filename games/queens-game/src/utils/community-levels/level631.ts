import {
  atomicTangerine,
  bittersweet,
  celadon,
  chardonnay,
  emerald,
  halfBaked,
  lightGreen,
  lightWisteria,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/631",
  size: 10,
  colorRegions: [
    ["A", "I", "F", "F", "A", "A", "E", "E", "I", "A"],
    ["C", "A", "F", "A", "G", "G", "A", "E", "A", "C"],
    ["J", "C", "A", "G", "G", "G", "G", "A", "C", "H"],
    ["J", "J", "C", "G", "G", "C", "G", "C", "H", "H"],
    ["C", "J", "J", "C", "A", "A", "C", "H", "H", "H"],
    ["J", "J", "J", "C", "A", "A", "C", "H", "H", "C"],
    ["J", "J", "C", "I", "C", "I", "I", "C", "H", "H"],
    ["J", "C", "A", "I", "I", "I", "I", "A", "A", "H"],
    ["C", "A", "B", "A", "I", "I", "A", "D", "A", "C"],
    ["A", "I", "B", "B", "A", "A", "D", "D", "I", "A"],
  ],
  regionColors: {
    A: emerald,
    B: chardonnay,
    C: lightWisteria,
    D: celadon,
    E: atomicTangerine,
    F: bittersweet,
    G: saharaSand,
    H: lightGreen,
    I: white,
    J: halfBaked,
  },
  solutionsCount: 1,
  createdBy: "meyina",
  creatorLink: "https://www.instagram.com/meyina009/",
};

export default level;
