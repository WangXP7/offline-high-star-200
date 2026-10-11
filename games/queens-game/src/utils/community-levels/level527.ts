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
  path: "/community-level/527",
  size: 10,
  colorRegions: [
    ["G", "G", "G", "B", "B", "B", "I", "I", "I", "I"],
    ["G", "D", "D", "B", "H", "B", "H", "F", "F", "I"],
    ["G", "D", "D", "B", "H", "H", "H", "F", "F", "F"],
    ["G", "D", "D", "B", "J", "H", "H", "F", "F", "H"],
    ["G", "J", "J", "J", "J", "H", "H", "H", "H", "H"],
    ["J", "J", "J", "E", "E", "E", "E", "H", "H", "H"],
    ["J", "J", "J", "E", "E", "E", "E", "H", "A", "H"],
    ["J", "C", "J", "E", "E", "E", "H", "H", "A", "H"],
    ["E", "C", "C", "C", "E", "A", "A", "A", "A", "E"],
    ["E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
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
  createdBy: "miclaraf",
  creatorLink: "",
};

export default level;
