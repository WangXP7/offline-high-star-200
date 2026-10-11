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
  path: "/community-level/562",
  size: 8,
  colorRegions: [
    ["A", "B", "B", "B", "B", "B", "B", "B"],
    ["B", "B", "C", "F", "F", "F", "F", "C"],
    ["B", "C", "C", "D", "H", "H", "H", "C"],
    ["B", "E", "D", "D", "H", "H", "H", "C"],
    ["B", "E", "G", "G", "H", "G", "G", "C"],
    ["B", "E", "H", "H", "F", "F", "F", "C"],
    ["B", "E", "H", "H", "H", "H", "C", "C"],
    ["B", "C", "C", "C", "C", "C", "C", "B"],
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
  createdBy: "maicon.backes",
  creatorLink: "",
};

export default level;
