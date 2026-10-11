import {
  altoMain,
  anakiwa,
  bittersweet,
  coldPurple,
  macNCheese,
  nomad,
  periwinkle,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/686",
  size: 9,
  colorRegions: [
    ["G", "H", "G", "E", "H", "G", "G", "H", "G"],
    ["E", "H", "G", "A", "A", "A", "E", "G", "H"],
    ["G", "G", "A", "B", "B", "B", "A", "H", "H"],
    ["H", "A", "B", "I", "I", "I", "B", "A", "G"],
    ["H", "A", "B", "F", "I", "F", "B", "A", "H"],
    ["E", "A", "D", "I", "I", "I", "D", "A", "H"],
    ["H", "H", "A", "A", "I", "A", "A", "G", "H"],
    ["G", "H", "D", "C", "I", "C", "D", "G", "E"],
    ["G", "D", "D", "C", "C", "C", "D", "D", "H"],
  ],
  regionColors: {
    A: white,
    B: nomad,
    C: bittersweet,
    D: altoMain,
    E: saharaSand,
    F: anakiwa,
    G: coldPurple,
    H: periwinkle,
    I: macNCheese,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
