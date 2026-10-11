import { anakiwa, emerald, periwinkle, saharaSand, white } from "../colors";

const level = {
  path: "/community-level/550",
  size: 11,
  colorRegions: [
    ["D", "D", "J", "J", "D", "D", "D", "D", "E", "E", "E"],
    ["D", "J", "J", "D", "D", "G", "D", "D", "D", "D", "E"],
    ["D", "J", "K", "D", "G", "G", "G", "D", "D", "D", "D"],
    ["D", "D", "K", "G", "G", "G", "G", "G", "D", "D", "D"],
    ["D", "D", "G", "G", "C", "C", "F", "G", "G", "D", "D"],
    ["D", "G", "G", "B", "B", "B", "B", "B", "G", "G", "D"],
    ["D", "D", "G", "G", "C", "C", "C", "G", "G", "D", "D"],
    ["D", "D", "D", "G", "G", "G", "G", "G", "D", "D", "H"],
    ["D", "D", "D", "D", "G", "G", "G", "D", "I", "I", "H"],
    ["A", "D", "D", "D", "D", "G", "D", "D", "D", "H", "H"],
    ["A", "A", "A", "A", "D", "D", "D", "D", "D", "D", "D"],
  ],
  regionColors: {
    A: emerald,
    B: white,
    C: anakiwa,
    D: emerald,
    E: emerald,
    F: periwinkle,
    G: saharaSand,
    H: emerald,
    I: emerald,
    J: emerald,
    K: emerald,
  },
  solutionsCount: 1,
  createdBy: "celeste",
  creatorLink: "",
};

export default level;
