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
  path: "/community-level/655",
  size: 11,
  colorRegions: [
    ["J", "J", "J", "J", "J", "H", "H", "E", "E", "A", "E"],
    ["K", "K", "J", "J", "J", "H", "H", "E", "C", "F", "F"],
    ["K", "J", "D", "J", "D", "H", "H", "H", "G", "B", "G"],
    ["K", "J", "D", "A", "F", "D", "H", "H", "G", "G", "G"],
    ["K", "D", "F", "B", "C", "D", "H", "H", "G", "G", "I"],
    ["K", "D", "F", "F", "D", "D", "H", "H", "G", "G", "I"],
    ["I", "D", "D", "D", "I", "D", "H", "H", "H", "G", "I"],
    ["I", "I", "I", "I", "I", "D", "H", "I", "I", "I", "I"],
    ["K", "K", "K", "K", "K", "F", "H", "H", "H", "H", "I"],
    ["E", "E", "F", "F", "A", "B", "C", "F", "F", "E", "I"],
    ["J", "E", "E", "E", "E", "F", "E", "E", "E", "E", "I"],
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
