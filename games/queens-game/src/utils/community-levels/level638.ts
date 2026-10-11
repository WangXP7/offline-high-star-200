import {
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  emerald,
  halfBaked,
  lavenderRose,
  lightOrchid,
  saharaSand,
  white,
} from "../colors";

const level = {
  path: "/community-level/638",
  size: 10,
  colorRegions: [
    ["E", "I", "I", "I", "I", "I", "I", "D", "I", "I"],
    ["I", "I", "B", "I", "G", "G", "I", "C", "I", "I"],
    ["I", "A", "I", "I", "I", "G", "H", "I", "H", "I"],
    ["F", "I", "J", "G", "G", "I", "G", "I", "I", "I"],
    ["I", "I", "J", "J", "J", "A", "I", "J", "I", "F"],
    ["I", "H", "G", "J", "G", "I", "G", "J", "H", "I"],
    ["I", "I", "G", "J", "G", "I", "J", "J", "I", "I"],
    ["I", "I", "G", "G", "G", "I", "G", "I", "I", "E"],
    ["I", "I", "H", "H", "C", "I", "I", "I", "D", "I"],
    ["I", "H", "I", "H", "H", "B", "G", "I", "H", "I"],
  ],
  regionColors: {
    A: white,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: lightOrchid,
    F: bittersweet,
    G: saharaSand,
    H: lavenderRose,
    I: emerald,
    J: halfBaked,
  },
  solutionsCount: 1,
  createdBy: "Ja-Nice",
  creatorLink: "https://www.linkedin.com/in/jan-hollmann-215a85315",
};

export default level;
