import {
  bittersweet,
  celadon,
  chardonnay,
  lavenderRose,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/541",
  size: 6,
  colorRegions: [
    ["B", "B", "D", "D", "D", "E"],
    ["B", "D", "D", "A", "D", "E"],
    ["B", "B", "C", "A", "D", "E"],
    ["B", "B", "C", "A", "D", "E"],
    ["B", "F", "C", "F", "E", "E"],
    ["B", "F", "F", "F", "F", "E"],
  ],
  regionColors: {
    A: saharaSand,
    B: chardonnay,
    C: lavenderRose,
    D: celadon,
    E: white,
    F: bittersweet,
  },
  solutionsCount: 1,
  createdBy: "JaNice",
  creatorLink: "",
};

export default level;
