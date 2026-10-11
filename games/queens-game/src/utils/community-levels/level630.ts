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
  path: "/community-level/630",
  size: 7,
  colorRegions: [
    ["A", "A", "E", "E", "E", "A", "C"],
    ["A", "E", "E", "B", "A", "C", "C"],
    ["A", "E", "B", "B", "B", "A", "A"],
    ["B", "G", "B", "B", "B", "F", "B"],
    ["C", "B", "G", "B", "F", "B", "C"],
    ["C", "B", "C", "D", "C", "B", "C"],
    ["C", "C", "D", "D", "D", "C", "C"],
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
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
