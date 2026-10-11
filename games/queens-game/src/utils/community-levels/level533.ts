import {
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lavenderRose,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/533",
  size: 7,
  colorRegions: [
    ["A", "A", "A", "E", "E", "E", "C"],
    ["B", "B", "A", "E", "E", "E", "E"],
    ["B", "B", "A", "A", "D", "D", "E"],
    ["F", "B", "F", "G", "D", "D", "D"],
    ["F", "B", "F", "G", "G", "D", "D"],
    ["F", "F", "F", "G", "G", "D", "D"],
    ["F", "F", "F", "G", "G", "D", "D"],
  ],
  regionColors: {
    A: saharaSand,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: white,
    F: bittersweet,
    G: lavenderRose,
  },
  solutionsCount: 1,
  createdBy: "amy",
  creatorLink: "",
};

export default level;
