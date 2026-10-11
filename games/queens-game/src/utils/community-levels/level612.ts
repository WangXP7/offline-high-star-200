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
  path: "/community-level/612",
  size: 11,
  colorRegions: [
    ["J", "J", "J", "A", "J", "J", "J", "J", "J", "B", "J"],
    ["F", "F", "J", "A", "G", "I", "I", "I", "I", "B", "J"],
    ["H", "H", "H", "A", "A", "H", "H", "H", "B", "B", "J"],
    ["J", "H", "J", "A", "I", "I", "I", "E", "J", "B", "J"],
    ["J", "H", "C", "J", "J", "J", "E", "E", "J", "B", "J"],
    ["J", "G", "C", "J", "J", "J", "E", "J", "J", "D", "D"],
    ["J", "C", "C", "G", "J", "J", "K", "K", "K", "D", "G"],
    ["J", "J", "C", "C", "C", "J", "H", "H", "H", "D", "D"],
    ["J", "E", "E", "C", "J", "J", "K", "K", "K", "D", "K"],
    ["J", "J", "E", "E", "E", "E", "E", "E", "K", "K", "K"],
    ["J", "J", "E", "E", "J", "J", "F", "F", "F", "F", "F"],
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
