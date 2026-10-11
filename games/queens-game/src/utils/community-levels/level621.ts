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
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/621",
  size: 11,
  colorRegions: [
    ["G", "G", "G", "J", "J", "J", "J", "G", "E", "E", "E"],
    ["G", "G", "G", "J", "G", "G", "G", "G", "G", "A", "E"],
    ["G", "G", "G", "G", "K", "G", "G", "G", "A", "I", "I"],
    ["G", "H", "A", "K", "K", "B", "J", "G", "G", "A", "E"],
    ["G", "A", "G", "G", "G", "G", "B", "G", "G", "G", "G"],
    ["K", "K", "K", "H", "K", "K", "K", "G", "G", "F", "G"],
    ["G", "K", "K", "K", "H", "K", "K", "K", "F", "H", "F"],
    ["G", "D", "G", "G", "G", "G", "C", "G", "G", "F", "G"],
    ["G", "E", "D", "K", "K", "C", "F", "G", "F", "H", "F"],
    ["G", "G", "G", "K", "G", "G", "G", "G", "G", "F", "G"],
    ["G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: white,
    H: nomad,
    I: lightOrchid,
    J: halfBaked,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "meyina",
  creatorLink: "",
};

export default level;
