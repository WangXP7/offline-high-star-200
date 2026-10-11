import {
  atomicTangerine,
  celadon,
  coldPurple,
  lightGreen,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/654",
  size: 7,
  colorRegions: [
    ["A", "E", "E", "E", "C", "C", "D"],
    ["A", "E", "E", "C", "C", "E", "B"],
    ["A", "C", "C", "C", "C", "E", "B"],
    ["A", "E", "C", "C", "E", "B", "B"],
    ["A", "F", "F", "F", "B", "B", "B"],
    ["A", "A", "A", "A", "A", "A", "B"],
    ["D", "F", "F", "F", "G", "G", "G"],
  ],
  regionColors: {
    A: coldPurple,
    B: turquoiseBlue,
    C: white,
    D: celadon,
    E: atomicTangerine,
    F: lightGreen,
    G: saharaSand,
  },
  solutionsCount: 1,
  createdBy: "AZ",
  creatorLink: "",
};

export default level;
