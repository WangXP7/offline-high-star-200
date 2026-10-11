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
  path: "/community-level/560",
  size: 11,
  colorRegions: [
    ["C", "C", "C", "C", "C", "J", "J", "J", "J", "I", "I"],
    ["G", "J", "J", "J", "J", "J", "J", "J", "J", "I", "I"],
    ["G", "J", "J", "J", "J", "J", "J", "J", "J", "I", "I"],
    ["G", "G", "G", "J", "J", "J", "J", "J", "B", "K", "I"],
    ["D", "D", "A", "A", "J", "J", "J", "K", "B", "K", "K"],
    ["D", "D", "D", "D", "J", "J", "J", "K", "K", "K", "K"],
    ["E", "D", "D", "D", "D", "K", "K", "K", "K", "K", "K"],
    ["E", "E", "D", "K", "K", "K", "K", "K", "K", "K", "K"],
    ["E", "E", "E", "E", "K", "K", "E", "K", "K", "K", "K"],
    ["F", "E", "E", "E", "E", "E", "E", "E", "E", "E", "H"],
    ["F", "F", "E", "E", "E", "E", "E", "E", "E", "H", "H"],
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
  createdBy: "ZenitraS",
  creatorLink: "https://github.com/ZenitraS",
};

export default level;
