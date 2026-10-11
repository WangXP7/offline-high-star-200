import {
  anakiwa,
  bittersweet,
  celadon,
  chardonnay,
  lightWisteria,
  turquoiseBlue,
} from "../colors";

const level = {
  path: "/community-level/507",
  size: 6,
  colorRegions: [
    ["E", "C", "E", "A", "B", "B"],
    ["E", "C", "E", "A", "C", "B"],
    ["E", "E", "E", "C", "C", "B"],
    ["F", "E", "E", "C", "A", "B"],
    ["E", "D", "E", "C", "A", "C"],
    ["E", "D", "E", "D", "F", "C"],
  ],
  regionColors: {
    A: celadon,
    B: chardonnay,
    C: anakiwa,
    D: turquoiseBlue,
    E: bittersweet,
    F: lightWisteria,
  },
  solutionsCount: 1,
  createdBy: "George Durnall",
  creatorLink: "",
};

export default level;
