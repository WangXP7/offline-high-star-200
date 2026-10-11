import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/704",
  size: 6,
  colorRegions: [
    ["F", "A", "A", "F", "D", "A"],
    ["F", "A", "A", "F", "E", "E"],
    ["C", "B", "C", "F", "B", "E"],
    ["A", "A", "F", "F", "C", "F"],
    ["F", "D", "C", "C", "B", "D"],
    ["A", "D", "A", "A", "C", "F"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
