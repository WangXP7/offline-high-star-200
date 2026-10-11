import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/719",
  size: 8,
  colorRegions: [
    ["G", "G", "A", "G", "C", "H", "H", "B"],
    ["F", "F", "A", "F", "A", "H", "E", "B"],
    ["B", "C", "C", "B", "A", "B", "A", "A"],
    ["D", "D", "C", "F", "A", "G", "E", "A"],
    ["D", "D", "A", "F", "A", "E", "E", "A"],
    ["C", "C", "A", "A", "A", "B", "A", "A"],
    ["B", "B", "C", "A", "C", "B", "B", "B"],
    ["H", "H", "C", "G", "C", "G", "E", "B"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
