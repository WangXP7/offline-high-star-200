import {
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  halfBaked,
  lightOrchid,
  lightWisteria,
  macNCheese,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/650",
  size: 11,
  colorRegions: [
    ["J", "J", "C", "K", "K", "K", "I", "I", "K", "K", "K"],
    ["J", "K", "K", "K", "G", "G", "G", "G", "G", "K", "K"],
    ["K", "K", "K", "E", "H", "K", "K", "K", "K", "K", "F"],
    ["A", "K", "K", "K", "H", "K", "K", "A", "K", "K", "K"],
    ["K", "K", "H", "K", "H", "K", "K", "B", "K", "K", "J"],
    ["K", "K", "H", "K", "C", "K", "K", "K", "D", "K", "J"],
    ["K", "H", "H", "I", "G", "G", "G", "G", "G", "G", "G"],
    ["K", "K", "K", "K", "H", "F", "K", "K", "K", "K", "K"],
    ["K", "K", "K", "K", "H", "K", "E", "K", "K", "K", "K"],
    ["K", "K", "D", "K", "H", "K", "K", "I", "K", "K", "J"],
    ["B", "K", "K", "K", "G", "G", "G", "G", "G", "G", "G"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: white,
    F: bittersweet,
    G: saharaSand,
    H: macNCheese,
    I: lightOrchid,
    J: halfBaked,
    K: turquoiseBlue,
  },
  solutionsCount: 1,
  createdBy: "meyina",
  creatorLink: "",
};

export default level;
