import {
  altoMain,
  atomicTangerine,
  chardonnay,
  emerald,
  lavenderRose,
  lightWisteria,
  nomad,
  periwinkle,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/700",
  size: 11,
  colorRegions: [
    ["A", "A", "B", "B", "F", "G", "G", "G", "K", "K", "K"],
    ["A", "B", "D", "F", "G", "G", "J", "J", "J", "H", "K"],
    ["A", "D", "F", "F", "G", "J", "J", "G", "H", "H", "K"],
    ["B", "B", "H", "G", "J", "J", "F", "H", "H", "I", "C"],
    ["B", "I", "H", "G", "J", "G", "F", "H", "I", "I", "K"],
    ["B", "I", "H", "G", "J", "G", "F", "H", "I", "I", "K"],
    ["B", "I", "H", "G", "J", "G", "F", "H", "I", "I", "K"],
    ["D", "D", "H", "G", "J", "J", "F", "H", "H", "I", "C"],
    ["E", "D", "D", "F", "G", "J", "J", "G", "H", "I", "C"],
    ["E", "D", "D", "D", "F", "G", "J", "J", "H", "H", "C"],
    ["E", "E", "E", "E", "F", "G", "G", "G", "C", "C", "C"],
  ],
  regionColors: {
    A: lightWisteria,
    B: emerald,
    C: nomad,
    D: turquoiseBlue,
    E: altoMain,
    F: chardonnay,
    G: saharaSand,
    H: atomicTangerine,
    I: lavenderRose,
    J: white,
    K: periwinkle,
  },
  solutionsCount: 1,
  createdBy: "VictorBandoiu",
  creatorLink: "https://www.instagram.com/victorban72/",
};

export default level;
