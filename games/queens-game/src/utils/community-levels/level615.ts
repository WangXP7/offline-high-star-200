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
  path: "/community-level/615",
  size: 7,
  colorRegions: [
    ["G", "G", "G", "G", "A", "A", "A"],
    ["G", "G", "G", "G", "A", "C", "A"],
    ["G", "G", "G", "A", "A", "A", "A"],
    ["G", "B", "B", "B", "B", "B", "B"],
    ["G", "E", "D", "D", "D", "B", "B"],
    ["E", "E", "E", "D", "B", "B", "B"],
    ["F", "E", "E", "D", "B", "B", "B"],
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
  createdBy: "vivimagri",
  creatorLink: "https://www.instagram.com/vivimagri?igsh=MTloc3VtOXFndzcwYQ==",
};

export default level;
