import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/594",
  size: 6,
  colorRegions: [
    ["C", "C", "C", "F", "F", "F"],
    ["D", "A", "C", "F", "F", "F"],
    ["D", "A", "B", "B", "F", "F"],
    ["D", "A", "A", "B", "F", "F"],
    ["D", "D", "E", "B", "F", "F"],
    ["D", "E", "E", "E", "E", "F"],
  ],
  regionColors: {
    A: lightWisteria,
    B: chardonnay,
    C: anakiwa,
    D: celadon,
    E: altoMain,
    F: bittersweet,
  },
  solutionsCount: 1,
  createdBy: "Pongo",
  creatorLink: "",
};

export default level;
