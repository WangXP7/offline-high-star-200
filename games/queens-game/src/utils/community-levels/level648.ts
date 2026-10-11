import {
  altoMain,
  anakiwa,
  macNCheese,
  periwinkle,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/648",
  size: 6,
  colorRegions: [
    ["F", "B", "C", "F", "C", "E"],
    ["C", "C", "C", "C", "C", "E"],
    ["E", "B", "E", "A", "C", "D"],
    ["E", "A", "E", "A", "C", "D"],
    ["D", "B", "E", "B", "C", "D"],
    ["D", "B", "E", "B", "C", "D"],
  ],
  regionColors: {
    A: altoMain,
    B: turquoiseBlue,
    C: anakiwa,
    D: periwinkle,
    E: macNCheese,
    F: white,
  },
  solutionsCount: 1,
  createdBy: "nextstone",
  creatorLink: "https://nextst.one",
};

export default level;
