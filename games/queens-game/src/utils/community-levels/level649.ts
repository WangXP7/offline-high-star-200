import {
  altoMain,
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  halfBaked,
  lightOrchid,
  lightWisteria,
  nomad,
  saharaSand,
} from "../colors";

const level = {
  path: "/community-level/649",
  size: 10,
  colorRegions: [
    ["D", "D", "J", "E", "H", "E", "E", "E", "I", "I"],
    ["D", "E", "E", "B", "E", "E", "D", "D", "D", "I"],
    ["D", "C", "E", "C", "C", "E", "D", "D", "C", "I"],
    ["A", "C", "C", "C", "C", "F", "D", "B", "C", "A"],
    ["A", "A", "C", "F", "F", "F", "D", "C", "A", "A"],
    ["G", "A", "B", "F", "B", "D", "B", "D", "D", "A"],
    ["G", "A", "E", "F", "E", "B", "D", "D", "A", "C"],
    ["G", "A", "B", "F", "B", "B", "D", "F", "A", "C"],
    ["G", "A", "F", "B", "F", "B", "D", "F", "A", "C"],
    ["G", "G", "J", "E", "H", "E", "E", "E", "C", "C"],
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
    I: lightOrchid,
    J: halfBaked,
  },
  solutionsCount: 1,
  createdBy: "Jess",
  creatorLink: "",
};

export default level;
