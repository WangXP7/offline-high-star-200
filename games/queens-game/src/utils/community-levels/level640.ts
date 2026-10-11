import {
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightOrchid,
  white,
} from "../colors";

const level = {
  path: "/community-level/640",
  size: 6,
  colorRegions: [
    ["A", "A", "A", "B", "B", "B"],
    ["C", "A", "D", "D", "D", "B"],
    ["C", "D", "D", "B", "B", "B"],
    ["C", "C", "D", "D", "D", "E"],
    ["C", "C", "C", "D", "D", "E"],
    ["C", "C", "C", "F", "F", "E"],
  ],
  regionColors: {
    A: white,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: lightOrchid,
    F: bittersweet,
  },
  solutionsCount: 1,
  createdBy: "Baert",
  creatorLink: "https://github.com/ElBartoUno",
};

export default level;
