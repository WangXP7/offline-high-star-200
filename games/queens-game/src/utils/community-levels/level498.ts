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
  path: "/community-level/498",
  size: 11,
  colorRegions: [
    ["G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G"],
    ["G", "J", "J", "J", "J", "J", "J", "J", "J", "J", "J"],
    ["G", "J", "J", "J", "I", "J", "B", "J", "J", "J", "J"],
    ["G", "E", "C", "C", "E", "B", "E", "C", "C", "C", "J"],
    ["G", "C", "C", "C", "B", "A", "B", "C", "C", "C", "J"],
    ["G", "K", "K", "K", "B", "B", "B", "K", "K", "C", "J"],
    ["G", "K", "G", "F", "F", "I", "I", "G", "K", "K", "J"],
    ["G", "K", "K", "K", "F", "I", "I", "G", "K", "K", "J"],
    ["G", "K", "K", "K", "I", "I", "I", "K", "K", "K", "J"],
    ["G", "D", "D", "D", "I", "I", "I", "D", "D", "D", "J"],
    ["G", "D", "D", "H", "H", "D", "H", "H", "D", "D", "J"],
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
  createdBy: "carolinneh",
  creatorLink: "",
};

export default level;
