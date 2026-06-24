import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5500",
    headless: true,
    screenshot: "on",
    video: "on",
    trace: "on",
    launchOptions: {
      slowMo: 0,
    },
  },
  reporter: [
    ["list"],
    ["json", { outputFile: "report.json" }],
    ["html", { open: "never" }],
  ],
  webServer: {
    command: "npx http-server -p 5500 -c-1",
    port: 5500,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
