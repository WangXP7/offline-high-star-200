import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  coldPurple,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/548",
  size: 8,
  colorRegions: [
    ["G", "G", "G", "G", "G", "G", "G", "G"],
    ["G", "D", "B", "B", "B", "B", "B", "G"],
    ["G", "D", "C", "F", "F", "A", "B", "G"],
    ["G", "D", "C", "C", "A", "A", "B", "G"],
    ["G", "D", "C", "C", "A", "A", "B", "G"],
    ["G", "D", "C", "C", "A", "A", "B", "G"],
    ["G", "D", "C", "H", "E", "A", "B", "G"],
    ["G", "D", "D", "D", "D", "D", "D", "E"],
  ],
  regionColors: {
    A: coldPurple,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
  },
  solutionsCount: 1,
  createdBy: "alyxkelp",
  creatorLink: "",
};

export default level;
