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
  path: "/community-level/716",
  size: 11,
  colorRegions: [
    ["B", "J", "J", "J", "J", "K", "J", "J", "A", "J", "A"],
    ["K", "E", "D", "I", "J", "J", "J", "J", "G", "J", "B"],
    ["K", "D", "D", "J", "J", "J", "G", "J", "G", "J", "B"],
    ["K", "I", "K", "I", "J", "J", "J", "E", "J", "J", "A"],
    ["K", "K", "K", "K", "H", "J", "E", "J", "G", "J", "J"],
    ["K", "K", "K", "K", "K", "I", "J", "J", "H", "J", "J"],
    ["K", "K", "F", "K", "E", "K", "I", "J", "J", "H", "J"],
    ["K", "K", "K", "E", "K", "K", "K", "H", "J", "J", "J"],
    ["C", "F", "F", "K", "F", "H", "K", "K", "D", "J", "E"],
    ["K", "K", "K", "K", "K", "K", "H", "K", "K", "E", "E"],
    ["C", "B", "B", "C", "K", "K", "K", "K", "E", "E", "B"],
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
  createdBy: "GuillermoAbadLopez",
  creatorLink: "https://github.com/GuillermoAbadLopez",
};

export default level;
