import {
  anakiwa,
  atomicTangerine,
  celadon,
  lavenderRose,
  lightWisteria,
  periwinkle,
  turquoiseBlue,
  white,
} from "../colors";

const level = {
  path: "/community-level/566",
  size: 8,
  colorRegions: [
    ["H", "G", "G", "G", "G", "G", "G", "G"],
    ["H", "E", "E", "A", "C", "C", "C", "G"],
    ["H", "E", "E", "A", "G", "B", "C", "G"],
    ["H", "E", "E", "E", "G", "B", "B", "G"],
    ["H", "F", "F", "E", "G", "D", "B", "G"],
    ["H", "F", "F", "F", "G", "D", "D", "G"],
    ["H", "H", "F", "F", "D", "D", "D", "G"],
    ["H", "H", "H", "H", "H", "H", "H", "H"],
  ],
  regionColors: {
    A: atomicTangerine,
    B: turquoiseBlue,
    C: anakiwa,
    D: celadon,
    E: lightWisteria,
    F: periwinkle,
    G: white,
    H: lavenderRose,
  },
  solutionsCount: 1,
  createdBy: "Naomi",
  creatorLink:
    "https://www.instagram.com/naomik_ana?igsh=cWR2ejhmeW0zMXk3&utm_source=qr",
};

export default level;
