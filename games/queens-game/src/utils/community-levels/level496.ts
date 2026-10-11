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
  turquoiseBlue,
} from "../colors";

const level = {
  path: "/community-level/496",
  size: 11,
  colorRegions: [
    ["D", "D", "D", "D", "J", "D", "D", "D", "D", "D", "D"],
    ["D", "D", "D", "J", "J", "F", "K", "K", "D", "D", "D"],
    ["D", "J", "J", "J", "F", "F", "F", "K", "K", "D", "D"],
    ["D", "E", "E", "F", "F", "A", "F", "F", "C", "C", "C"],
    ["E", "E", "F", "F", "B", "A", "A", "F", "F", "C", "C"],
    ["E", "F", "F", "B", "B", "G", "G", "G", "F", "F", "C"],
    ["E", "H", "F", "F", "B", "B", "G", "F", "F", "C", "C"],
    ["H", "H", "D", "F", "F", "B", "F", "F", "I", "C", "D"],
    ["H", "H", "H", "D", "F", "F", "F", "D", "I", "D", "D"],
    ["D", "H", "D", "D", "D", "F", "D", "I", "I", "I", "D"],
    ["D", "D", "D", "D", "D", "D", "D", "D", "I", "D", "D"],
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
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "Emi S",
  creatorLink: "https://www.instagram.com/meyina009/",
};

export default level;
