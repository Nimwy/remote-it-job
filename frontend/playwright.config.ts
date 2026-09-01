import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BACKEND_PORT = 8001;
const BASE_URL = `http://localhost:${PORT}`;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: BASE_URL,
    locale: "vi-VN",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      // Backend cô lập trên DB remoteit_e2e (T-04)
      command: `cd ${process.cwd()} && docker compose up -d backend-e2e`,
      url: `${BACKEND_URL}/api/jobs`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      // Frontend trỏ tới backend-e2e qua BACKEND_URL
      command: `cd ${process.cwd()} && BACKEND_URL=${BACKEND_URL} npm run dev -- -p ${PORT}`,
      url: BASE_URL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
