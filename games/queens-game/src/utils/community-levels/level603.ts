import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  halfBaked,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/603",
  size: 10,
  colorRegions: [
    ["A", "A", "B", "B", "B", "C", "D", "D", "D", "D"],
    ["A", "B", "B", "J", "J", "C", "C", "C", "C", "D"],
    ["A", "B", "I", "J", "I", "J", "J", "J", "C", "D"],
    ["B", "B", "J", "J", "J", "J", "I", "J", "C", "D"],
    ["J", "J", "I", "J", "J", "J", "J", "J", "C", "C"],
    ["G", "J", "J", "J", "I", "J", "J", "I", "C", "E"],
    ["G", "I", "J", "I", "J", "J", "I", "J", "J", "E"],
    ["G", "G", "J", "J", "J", "J", "J", "I", "F", "E"],
    ["H", "G", "G", "G", "G", "I", "J", "F", "F", "E"],
    ["H", "H", "H", "H", "G", "G", "F", "F", "E", "E"],
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
    I: lightOrchid,
    J: halfBaked,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
