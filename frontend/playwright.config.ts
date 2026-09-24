import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BACKEND_PORT = 8001;
const BASE_URL = `http://localhost:${PORT}`;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  // CI: retry 1 lần để trace được ghi khi test lỗi (retain-on-failure) và lọc test chập chờn
  retries: CI ? 1 : 0,
  workers: 1,
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: BASE_URL,
    locale: "vi-VN",
    trace: "retain-on-failure",
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
      url: `${BACKEND_URL}/api/health`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      // Frontend trỏ tới backend-e2e qua BACKEND_URL.
      // CI: chạy bản build (next start) giống production — build đã làm ở step trước với
      // BACKEND_URL=backend-e2e (rewrites bị cố định lúc build). Local: next dev.
      command: `cd ${process.cwd()} && BACKEND_URL=${BACKEND_URL} npm run ${CI ? "start" : "dev"} -- -p ${PORT}`,
      url: BASE_URL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
