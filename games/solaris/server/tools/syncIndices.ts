import { makeJob } from "./tool";

const job = makeJob("Sync indices", async (_params) => {}, {
    syncIndexes: true,
});

job();

export {};
