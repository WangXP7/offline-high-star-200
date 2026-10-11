import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  halfBaked,
  lavenderRose,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/499",
  size: 11,
  colorRegions: [
    ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"],
    ["B", "J", "J", "J", "J", "J", "J", "J", "G", "G", "G"],
    ["B", "F", "F", "F", "J", "J", "J", "A", "A", "A", "G"],
    ["B", "F", "F", "H", "F", "J", "A", "D", "A", "A", "G"],
    ["B", "J", "F", "H", "F", "B", "A", "D", "A", "J", "G"],
    ["B", "J", "F", "H", "F", "E", "A", "D", "A", "J", "G"],
    ["B", "J", "J", "F", "F", "B", "A", "A", "J", "D", "G"],
    ["I", "J", "J", "K", "K", "B", "K", "K", "D", "D", "G"],
    ["I", "I", "K", "H", "K", "J", "K", "C", "K", "J", "G"],
    ["B", "I", "J", "K", "J", "J", "J", "K", "J", "J", "G"],
    ["B", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G"],
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
    K: lavenderRose,
  },
  solutionsCount: 1,
  createdBy: "helloysaaac",
  creatorLink: "",
};

export default level;
