import {
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  emerald,
  lavenderRose,
  lightOrchid,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/639",
  size: 9,
  colorRegions: [
    ["I", "F", "F", "A", "F", "F", "I", "I", "I"],
    ["I", "F", "F", "F", "F", "F", "I", "I", "I"],
    ["C", "A", "B", "B", "B", "D", "C", "D", "D"],
    ["I", "A", "A", "A", "B", "D", "I", "H", "H"],
    ["A", "I", "I", "I", "B", "D", "H", "H", "H"],
    ["A", "I", "C", "I", "B", "D", "H", "H", "H"],
    ["A", "I", "I", "I", "A", "A", "I", "I", "H"],
    ["A", "E", "E", "A", "G", "G", "I", "I", "H"],
    ["A", "G", "G", "A", "G", "G", "I", "I", "H"],
  ],
  regionColors: {
    A: white,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: lightOrchid,
    F: bittersweet,
    G: saharaSand,
    H: lavenderRose,
    I: emerald,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
