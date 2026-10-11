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
  path: "/community-level/596",
  size: 11,
  colorRegions: [
    ["G", "G", "G", "K", "K", "G", "G", "H", "H", "G", "G"],
    ["G", "K", "K", "K", "G", "G", "G", "G", "H", "H", "G"],
    ["G", "G", "K", "G", "G", "F", "G", "H", "H", "G", "G"],
    ["G", "G", "G", "G", "G", "F", "G", "G", "G", "G", "G"],
    ["G", "B", "G", "G", "F", "F", "F", "I", "I", "A", "A"],
    ["G", "B", "G", "G", "G", "F", "G", "I", "I", "A", "G"],
    ["G", "B", "B", "J", "G", "G", "G", "G", "I", "A", "G"],
    ["E", "E", "E", "J", "G", "G", "G", "G", "G", "G", "G"],
    ["D", "E", "J", "J", "J", "J", "C", "C", "C", "C", "G"],
    ["D", "G", "G", "G", "G", "G", "G", "C", "C", "G", "G"],
    ["D", "D", "D", "D", "G", "G", "G", "G", "G", "G", "G"],
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
  creatorLink: "http://linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
