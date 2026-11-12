import { spawnSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import path from "node:path";
import { projectRoot } from "./sites-env.mjs";
import { readExecutionProfile } from "./execution-profile.mjs";

if (!["SHARP_IGNORE_GLOBAL_LIBVIPS", "SHARP_FORCE_GLOBAL_LIBVIPS", "npm_config_build_from_source", "NPM_CONFIG_BUILD_FROM_SOURCE"].some((key) => key in process.env)) {
  process.env.SHARP_IGNORE_GLOBAL_LIBVIPS = "1";
}

if (readExecutionProfile() === "managed-linux") {
  const result = spawnSync("bash", [path.join(projectRoot, "scripts/install-pnpm.sh")], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

const executable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(executable, ["install", "--frozen-lockfile"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

try {
  accessSync(path.join(projectRoot, "node_modules", ".bin", process.platform === "win32" ? "vinext.cmd" : "vinext"), constants.F_OK);
} catch {
  console.error("pnpm install completed but the local vinext executable is unavailable.");
  process.exitCode = 69;
}
