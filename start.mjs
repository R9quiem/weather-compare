import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

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

const python = process.platform === "win32"
  ? join(root, ".venv", "Scripts", "python.exe")
  : join(root, ".venv", "bin", "python");

run(
  "backend",
  python,
  ["-m", "uvicorn", "app.main_api:app", "--reload"],
  join(root, "backend"),
);
run("frontend", "npm", ["run", "dev"], join(root, "frontend"));
