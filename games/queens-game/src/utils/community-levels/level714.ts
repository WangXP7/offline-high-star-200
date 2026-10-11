import {
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  halfBaked,
  lavenderRose,
  lightOrchid,
  lightWisteria,
  macNCheese,
  periwinkle,
  turquoiseBlue,
} from "../colors";

const level = {
  path: "/community-level/714",
  size: 11,
  colorRegions: [
    ["I", "I", "I", "I", "I", "C", "C", "C", "K", "A", "K"],
    ["I", "I", "I", "G", "G", "G", "C", "C", "A", "K", "A"],
    ["I", "I", "G", "G", "G", "G", "G", "C", "C", "A", "C"],
    ["I", "G", "G", "E", "G", "E", "G", "G", "C", "G", "F"],
    ["I", "G", "G", "G", "G", "G", "G", "G", "C", "G", "F"],
    ["J", "G", "G", "G", "B", "B", "G", "G", "G", "G", "F"],
    ["J", "G", "G", "G", "G", "G", "G", "G", "D", "D", "F"],
    ["J", "G", "G", "G", "G", "G", "G", "D", "D", "F", "F"],
    ["G", "G", "G", "G", "G", "G", "G", "D", "F", "F", "H"],
    ["G", "J", "C", "G", "C", "C", "G", "D", "F", "F", "H"],
    ["J", "J", "G", "G", "F", "C", "G", "G", "F", "H", "H"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: periwinkle,
    F: bittersweet,
    G: macNCheese,
    H: lavenderRose,
    I: lightOrchid,
    J: halfBaked,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "VictorBandoiu",
  creatorLink: "https://www.instagram.com/victorban72/",
};

export default level;
