import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/505",
  size: 7,
  colorRegions: [
    ["F", "C", "C", "A", "C", "A", "B"],
    ["F", "E", "A", "G", "E", "C", "B"],
    ["A", "B", "A", "E", "F", "C", "B"],
    ["G", "G", "B", "C", "F", "D", "B"],
    ["B", "C", "B", "D", "D", "A", "B"],
    ["F", "F", "C", "A", "B", "D", "B"],
    ["C", "G", "B", "C", "G", "B", "B"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
  },
  solutionsCount: 1,
  createdBy: "Dan Relaxxe",
  creatorLink: "https://github.com/DanRelaxxe",
};

export default level;
