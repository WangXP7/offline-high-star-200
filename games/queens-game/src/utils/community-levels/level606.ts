import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  lightWisteria,
  saharaSand,
  turquoiseBlue,
} from "../colors";

const level = {
  path: "/community-level/606",
  size: 7,
  colorRegions: [
    ["A", "B", "C", "B", "E", "C", "C"],
    ["A", "B", "C", "F", "E", "C", "C"],
    ["A", "A", "E", "E", "A", "E", "E"],
    ["A", "D", "E", "E", "E", "C", "C"],
    ["A", "E", "B", "D", "C", "C", "F"],
    ["A", "B", "B", "D", "C", "F", "G"],
    ["A", "B", "C", "C", "B", "C", "G"],
  ],
  regionColors: {
    A: lightWisteria,
    B: turquoiseBlue,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
    G: saharaSand,
  },
  solutionsCount: 1,
  createdBy: "Glutamatinho",
  creatorLink: "",
};

export default level;
