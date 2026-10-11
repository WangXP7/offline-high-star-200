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
  path: "/community-level/684",
  size: 11,
  colorRegions: [
    ["A", "A", "I", "I", "F", "F", "F", "F", "K", "K", "K"],
    ["A", "I", "I", "I", "I", "I", "I", "F", "D", "K", "K"],
    ["A", "I", "I", "E", "E", "I", "E", "F", "E", "C", "K"],
    ["K", "J", "I", "I", "I", "J", "I", "J", "B", "K", "K"],
    ["J", "I", "I", "I", "I", "I", "K", "G", "K", "K", "K"],
    ["J", "I", "K", "E", "D", "H", "H", "G", "K", "K", "K"],
    ["K", "E", "E", "E", "E", "B", "H", "H", "K", "K", "K"],
    ["C", "J", "J", "I", "C", "H", "K", "H", "K", "K", "K"],
    ["D", "J", "I", "K", "H", "H", "H", "G", "K", "K", "K"],
    ["B", "C", "D", "B", "H", "H", "G", "G", "H", "H", "G"],
    ["K", "K", "K", "I", "K", "H", "H", "H", "K", "K", "K"],
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
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
