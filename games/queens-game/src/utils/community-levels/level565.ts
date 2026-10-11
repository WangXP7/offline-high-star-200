import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  lavenderRose,
  lightOrchid,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/565",
  size: 7,
  colorRegions: [
    ["A", "A", "A", "G", "G", "G", "G"],
    ["B", "B", "A", "A", "A", "G", "G"],
    ["B", "B", "B", "A", "F", "F", "G"],
    ["C", "C", "B", "B", "F", "F", "G"],
    ["C", "C", "D", "F", "F", "F", "G"],
    ["D", "D", "D", "E", "E", "F", "G"],
    ["E", "E", "E", "E", "F", "F", "G"],
  ],
  regionColors: {
    A: lightWisteria,
    B: anakiwa,
    C: altoMain,
    D: celadon,
    E: lightOrchid,
    F: bittersweet,
    G: lavenderRose,
  },
  solutionsCount: 1,
  createdBy: "Max20xx",
  creatorLink: "",
};

export default level;
