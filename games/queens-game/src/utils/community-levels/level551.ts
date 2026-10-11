import {
  altoMain,
  anakiwa,
  bittersweet,
  chardonnay,
  halfBaked,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/551",
  size: 11,
  colorRegions: [
    ["A", "A", "A", "A", "B", "B", "B", "B", "B", "B", "B"],
    ["A", "A", "A", "A", "A", "B", "B", "B", "B", "B", "B"],
    ["A", "A", "A", "A", "A", "B", "B", "D", "B", "B", "B"],
    ["A", "A", "A", "A", "B", "B", "K", "D", "D", "B", "C"],
    ["A", "A", "A", "A", "B", "K", "K", "D", "D", "B", "C"],
    ["F", "F", "F", "K", "K", "K", "D", "D", "D", "C", "C"],
    ["G", "F", "F", "F", "K", "K", "D", "D", "D", "C", "C"],
    ["G", "G", "H", "K", "K", "K", "D", "I", "D", "E", "E"],
    ["G", "G", "H", "K", "K", "K", "I", "I", "D", "E", "E"],
    ["G", "G", "H", "H", "H", "H", "I", "J", "J", "E", "J"],
    ["G", "G", "G", "G", "G", "H", "I", "I", "J", "J", "J"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: white,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
    H: nomad,
    I: lightOrchid,
    J: halfBaked,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "streeb",
  creatorLink: "",
};

export default level;
