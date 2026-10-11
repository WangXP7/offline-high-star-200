import {
  altoMain,
  anakiwa,
  halfBaked,
  lavenderRose,
  lightOrchid,
  periwinkle,
  turquoiseBlue,
} from "../colors";

const level = {
  path: "/community-level/593",
  size: 7,
  colorRegions: [
    ["G", "G", "G", "A", "A", "A", "A"],
    ["G", "F", "F", "F", "A", "F", "F"],
    ["G", "C", "C", "C", "B", "F", "F"],
    ["G", "C", "B", "B", "B", "D", "D"],
    ["E", "C", "C", "C", "C", "C", "D"],
    ["E", "E", "E", "E", "E", "C", "C"],
    ["F", "F", "F", "E", "E", "E", "E"],
  ],
  regionColors: {
    A: lightOrchid,
    B: turquoiseBlue,
    C: anakiwa,
    D: halfBaked,
    E: altoMain,
    F: lavenderRose,
    G: periwinkle,
  },
  solutionsCount: 1,
  createdBy: "mortomuitograto",
  creatorLink: "",
};

export default level;
