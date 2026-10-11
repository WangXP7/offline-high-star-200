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
    SCA_DESKTOP_SMOKE_DISPLAY: "1"
  },
  stdio: "inherit",
  windowsHide: true
});

child.once("error", error => {
  console.error(error);
  process.exitCode = 1;
});
child.once("exit", (code, signal) => {
  if (signal) {
    console.error(`桌面显示模式冒烟测试被信号终止：${signal}`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code || 0;
});
