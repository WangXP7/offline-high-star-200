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
  path: "/community-level/483",
  size: 11,
  colorRegions: [
    ["I", "I", "I", "I", "I", "I", "I", "I", "I", "I", "I"],
    ["E", "B", "B", "J", "J", "J", "C", "J", "C", "J", "I"],
    ["E", "B", "J", "B", "J", "C", "J", "C", "J", "C", "I"],
    ["E", "B", "B", "J", "J", "C", "J", "C", "J", "H", "I"],
    ["E", "B", "J", "B", "J", "J", "J", "D", "J", "D", "I"],
    ["E", "B", "B", "J", "G", "J", "J", "J", "D", "J", "I"],
    ["E", "E", "J", "J", "J", "J", "J", "J", "D", "J", "I"],
    ["E", "E", "E", "F", "J", "F", "J", "J", "J", "J", "I"],
    ["E", "E", "F", "F", "F", "F", "F", "J", "A", "J", "I"],
    ["E", "E", "E", "F", "F", "F", "K", "K", "K", "J", "I"],
    ["E", "E", "E", "E", "F", "E", "K", "K", "K", "K", "I"],
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
  createdBy: "Savva Zhukov",
  creatorLink: "https://www.instagram.com/sogga.sogga",
};

export default level;
