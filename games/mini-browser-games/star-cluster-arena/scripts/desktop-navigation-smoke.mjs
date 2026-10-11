import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const forgeCli = resolve(projectRoot, "node_modules/@electron-forge/cli/dist/electron-forge.js");
const child = spawn(process.execPath, [forgeCli, "start"], {
  cwd: projectRoot,
  env: {
    ...process.env,
    SCA_DESKTOP_SMOKE: "1",
    SCA_DESKTOP_SMOKE_NAVIGATION: "1"
  },
  stdio: "inherit",
  windowsHide: true
});

child.on("error", error => {
  console.error(error);
  process.exitCode = 1;
});

child.on("exit", code => {
  process.exitCode = code || 0;
});
