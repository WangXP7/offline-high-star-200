import {
  atomicTangerine,
  bittersweet,
  lavenderRose,
  lightOrchid,
  periwinkle,
} from "../colors";

const level = {
  path: "/community-level/526",
  size: 7,
  colorRegions: [
    ["E", "C", "C", "C", "G", "G", "G"],
    ["E", "C", "F", "A", "G", "G", "G"],
    ["E", "E", "E", "A", "D", "D", "D"],
    ["E", "A", "A", "A", "A", "A", "D"],
    ["B", "B", "B", "A", "D", "D", "D"],
    ["B", "A", "A", "A", "A", "A", "D"],
    ["B", "B", "B", "B", "B", "C", "C"],
  ],
  regionColors: {
    A: bittersweet,
    B: lightOrchid,
    C: atomicTangerine,
    D: periwinkle,
    E: lavenderRose,
    F: periwinkle,
    G: lightOrchid,
  },
  solutionsCount: 1,
  createdBy: "Daliceous",
  creatorLink: "",
};

export default level;
