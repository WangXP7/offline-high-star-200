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
  path: "/community-level/500",
  size: 11,
  colorRegions: [
    ["E", "E", "E", "E", "E", "G", "G", "A", "A", "A", "A"],
    ["E", "E", "E", "E", "E", "G", "A", "A", "A", "A", "A"],
    ["E", "F", "E", "F", "E", "F", "A", "F", "A", "F", "A"],
    ["E", "F", "F", "F", "E", "F", "A", "F", "F", "F", "A"],
    ["E", "C", "F", "F", "F", "F", "F", "F", "F", "B", "A"],
    ["H", "C", "C", "F", "F", "D", "F", "F", "B", "B", "I"],
    ["H", "C", "C", "C", "F", "D", "F", "B", "B", "B", "K"],
    ["J", "C", "C", "C", "C", "D", "B", "B", "B", "B", "K"],
    ["J", "C", "J", "J", "J", "J", "J", "J", "K", "B", "K"],
    ["J", "C", "C", "J", "K", "K", "K", "J", "K", "K", "K"],
    ["J", "J", "J", "J", "K", "G", "K", "K", "K", "K", "K"],
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
  createdBy: "LilyoftheValley",
  creatorLink: "",
};

export default level;
