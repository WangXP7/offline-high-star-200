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
  path: "/community-level/580",
  size: 11,
  colorRegions: [
    ["G", "G", "I", "D", "D", "D", "D", "G", "H", "G", "G"],
    ["G", "G", "I", "B", "D", "C", "D", "B", "H", "G", "G"],
    ["F", "I", "I", "B", "B", "C", "B", "B", "H", "H", "H"],
    ["F", "A", "A", "A", "A", "C", "B", "A", "B", "A", "F"],
    ["F", "A", "E", "A", "F", "F", "F", "A", "A", "A", "F"],
    ["F", "F", "F", "F", "F", "C", "F", "F", "F", "F", "F"],
    ["F", "A", "A", "A", "F", "F", "F", "A", "A", "A", "E"],
    ["F", "A", "A", "A", "A", "A", "A", "A", "A", "A", "F"],
    ["K", "K", "K", "B", "B", "C", "B", "B", "J", "J", "J"],
    ["E", "E", "K", "B", "C", "C", "D", "B", "J", "E", "E"],
    ["E", "E", "K", "B", "D", "D", "D", "D", "D", "E", "E"],
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
