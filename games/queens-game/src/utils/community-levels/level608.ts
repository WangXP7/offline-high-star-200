import {
  atomicTangerine,
  celadon,
  chardonnay,
  coldPurple,
  halfBaked,
  lightGreen,
  lightOrchid,
  periwinkle,
  saharaSand,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/608",
  size: 11,
  colorRegions: [
    ["K", "K", "K", "K", "K", "K", "K", "J", "J", "J", "J"],
    ["K", "K", "K", "K", "K", "I", "I", "K", "K", "K", "J"],
    ["K", "K", "I", "I", "I", "I", "G", "G", "G", "K", "K"],
    ["K", "H", "H", "K", "K", "K", "K", "G", "F", "F", "K"],
    ["K", "K", "H", "K", "K", "K", "E", "K", "F", "K", "K"],
    ["K", "K", "K", "K", "E", "E", "E", "K", "F", "K", "K"],
    ["K", "K", "D", "D", "K", "K", "K", "K", "K", "K", "K"],
    ["K", "K", "D", "K", "K", "B", "B", "B", "K", "K", "K"],
    ["K", "D", "D", "K", "K", "B", "K", "B", "C", "C", "K"],
    ["K", "A", "K", "K", "K", "B", "K", "C", "C", "K", "K"],
    ["A", "A", "A", "K", "K", "B", "K", "C", "K", "K", "K"],
  ],
  regionColors: {
    A: periwinkle,
    B: turquoiseBlue,
    C: lightGreen,
    D: halfBaked,
    E: celadon,
    F: saharaSand,
    G: chardonnay,
    H: lightOrchid,
    I: atomicTangerine,
    J: coldPurple,
    K: white,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
