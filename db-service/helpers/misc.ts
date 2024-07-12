import { spawn } from "child_process";
export function restart() {
  console.log("Restarting application...");

  // Spawn a new process
  const child = spawn(process.argv[0], process.argv.slice(1), {
    detached: true,
    stdio: "inherit",
  });

  // Unref() allows the parent to exit independently of the child
  child.unref();

  // Exit the current process
  process.exit();
}
