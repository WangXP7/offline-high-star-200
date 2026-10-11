import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/685",
  size: 8,
  colorRegions: [
    ["D", "D", "D", "E", "E", "F", "F", "G"],
    ["H", "H", "D", "H", "E", "H", "F", "G"],
    ["H", "H", "D", "H", "E", "H", "H", "H"],
    ["H", "H", "D", "H", "H", "H", "H", "H"],
    ["A", "H", "H", "H", "H", "H", "H", "H"],
    ["A", "H", "H", "B", "H", "H", "H", "H"],
    ["A", "H", "H", "B", "H", "C", "H", "H"],
    ["A", "A", "A", "B", "B", "C", "C", "H"],
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
  },
  solutionsCount: 1,
  createdBy: "OurKez",
  creatorLink: "https://github.com/Lightfot1988",
};

export default level;
