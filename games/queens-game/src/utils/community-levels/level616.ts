import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  halfBaked,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/616",
  size: 11,
  colorRegions: [
    ["G", "D", "D", "J", "J", "J", "J", "J", "B", "I", "I"],
    ["F", "G", "J", "J", "J", "J", "J", "B", "B", "I", "J"],
    ["G", "F", "J", "E", "E", "J", "B", "E", "B", "B", "B"],
    ["J", "J", "F", "C", "C", "B", "C", "C", "E", "B", "J"],
    ["J", "E", "C", "F", "C", "C", "C", "C", "B", "E", "J"],
    ["J", "E", "C", "C", "F", "C", "C", "B", "C", "E", "J"],
    ["A", "J", "A", "C", "C", "C", "C", "C", "E", "J", "J"],
    ["A", "J", "A", "E", "C", "C", "C", "E", "J", "J", "J"],
    ["A", "A", "A", "J", "E", "C", "E", "J", "F", "J", "J"],
    ["A", "J", "A", "J", "J", "E", "J", "J", "J", "F", "H"],
    ["A", "K", "A", "K", "J", "J", "J", "J", "J", "H", "H"],
  ],
  regionColors: {
    A: lightWisteria,
    B: anakiwa,
    C: bittersweet,
    D: celadon,
    E: altoMain,
    F: lightOrchid,
    G: white,
    H: nomad,
    I: saharaSand,
    J: halfBaked,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "akuma",
  creatorLink: "",
};

export default level;
