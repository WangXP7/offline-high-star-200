import {
  altoMain,
  atomicTangerine,
  bittersweet,
  celadon,
  chardonnay,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/658",
  size: 9,
  colorRegions: [
    ["B", "H", "B", "B", "G", "G", "A", "A", "A"],
    ["B", "H", "H", "I", "I", "G", "G", "F", "A"],
    ["E", "I", "H", "H", "I", "F", "G", "G", "A"],
    ["I", "I", "I", "H", "H", "F", "F", "F", "F"],
    ["D", "I", "I", "H", "I", "E", "E", "F", "A"],
    ["D", "I", "H", "H", "I", "F", "E", "F", "C"],
    ["I", "I", "I", "I", "I", "F", "F", "F", "I"],
    ["H", "I", "I", "I", "F", "F", "E", "F", "I"],
    ["D", "I", "H", "I", "D", "E", "C", "C", "C"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: atomicTangerine,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
    I: lightOrchid,
  },
  solutionsCount: 1,
  createdBy: "saemiuel",
  creatorLink:
    "https://www.linkedin.com/in/samuel-cataldi-0296bb254?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
};

export default level;
