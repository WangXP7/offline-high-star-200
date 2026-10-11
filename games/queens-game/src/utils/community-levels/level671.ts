import {
  anakiwa,
  atomicTangerine,
  celadon,
  coldPurple,
  emerald,
  halfBaked,
  lightWisteria,
} from "../colors";

const level = {
  path: "/community-level/671",
  size: 7,
  colorRegions: [
    ["A", "A", "A", "A", "E", "G", "F"],
    ["D", "D", "D", "D", "C", "C", "C"],
    ["D", "D", "E", "F", "G", "F", "G"],
    ["C", "D", "A", "A", "B", "B", "B"],
    ["C", "C", "G", "F", "E", "A", "B"],
    ["D", "D", "D", "D", "D", "A", "A"],
    ["G", "F", "E", "D", "D", "A", "B"],
  ],
  regionColors: {
    A: coldPurple,
    B: atomicTangerine,
    C: lightWisteria,
    D: celadon,
    E: anakiwa,
    F: halfBaked,
    G: emerald,
  },
  solutionsCount: 1,
  createdBy: "Peter Hogan",
  creatorLink: "",
};

export default level;
