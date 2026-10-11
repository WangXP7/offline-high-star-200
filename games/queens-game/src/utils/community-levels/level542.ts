import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/542",
  size: 8,
  colorRegions: [
    ["F", "F", "F", "F", "F", "F", "F", "F"],
    ["F", "F", "F", "F", "A", "A", "F", "F"],
    ["D", "F", "G", "F", "F", "A", "F", "F"],
    ["D", "F", "G", "G", "F", "F", "F", "F"],
    ["F", "F", "F", "F", "F", "F", "F", "H"],
    ["F", "F", "B", "F", "F", "C", "F", "H"],
    ["F", "B", "B", "F", "C", "C", "F", "H"],
    ["F", "E", "F", "F", "F", "F", "F", "F"],
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
  },
  solutionsCount: 1,
  createdBy: "Llindawg",
  creatorLink: "",
};

export default level;
