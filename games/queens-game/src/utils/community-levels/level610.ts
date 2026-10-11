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
  path: "/community-level/610",
  size: 11,
  colorRegions: [
    ["D", "D", "D", "D", "D", "D", "E", "E", "E", "E", "E"],
    ["D", "K", "I", "K", "K", "C", "K", "K", "K", "J", "E"],
    ["D", "I", "H", "I", "C", "D", "C", "B", "J", "G", "J"],
    ["A", "K", "I", "K", "K", "C", "K", "K", "K", "J", "K"],
    ["C", "K", "D", "K", "K", "K", "K", "K", "K", "F", "A"],
    ["F", "K", "I", "K", "K", "C", "K", "K", "K", "A", "F"],
    ["A", "A", "A", "A", "A", "C", "C", "A", "C", "F", "B"],
    ["A", "K", "A", "K", "A", "C", "K", "K", "B", "B", "B"],
    ["A", "K", "A", "K", "K", "B", "K", "K", "K", "H", "A"],
    ["B", "K", "G", "K", "B", "B", "K", "K", "K", "H", "C"],
    ["G", "C", "J", "G", "C", "D", "E", "F", "H", "I", "H"],
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
  createdBy: "Jess",
  creatorLink: "",
};

export default level;
