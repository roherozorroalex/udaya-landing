import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 4173;
const url = `http://127.0.0.1:${port}`;
const command = process.platform === "win32" ? "serve.cmd" : "serve";

const server = spawn(command, ["-l", `tcp://127.0.0.1:${port}`, "."], {
  stdio: "ignore"
});

async function waitForServer() {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch {
      // Server is still booting.
    }

    await delay(300);
  }

  throw new Error(`Smoke server did not start at ${url}`);
}

try {
  const response = await waitForServer();
  const html = await response.text();

  if (!html.includes("For the moments")) {
    throw new Error("Hero copy did not render in served HTML");
  }

  if (html.includes('<aside class="hero-panel"')) {
    throw new Error("Removed hero right panel is still present in rendered HTML");
  }

  if (!html.includes("<span>back into yourself</span>")) {
    throw new Error("Mint heading accents were not found in the served HTML");
  }

  console.log(`Smoke OK: ${url}`);
} finally {
  server.kill("SIGTERM");
}
