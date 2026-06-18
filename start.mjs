import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const mode = process.argv[2] ?? "dev";

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    console.log(`${name} exited with code ${code}`);
  });

  return child;
}

function runOnce(name, command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: true,
    });

    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${name} exited with code ${code}`));
    });
  });
}

const python = process.platform === "win32"
  ? join(root, ".venv", "Scripts", "python.exe")
  : join(root, ".venv", "bin", "python");

if (mode === "dev") {
  run("backend", python, ["-m", "uvicorn", "app.main_api:app", "--reload"], join(root, "backend"));
  run("frontend", "npm", ["run", "dev"], join(root, "frontend"));
} else if (mode === "prod") {
  await runOnce("frontend build", "npm", ["run", "build"], join(root, "frontend"));
  run("backend", python, ["-m", "uvicorn", "app.main_api:app"], join(root, "backend"));
} else {
  console.error("Unknown mode. Use: dev or prod");
  process.exit(1);
}