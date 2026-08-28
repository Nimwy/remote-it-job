import { expect, test } from "@playwright/test";

const HR_EMAIL = "demo.hr@remoteit.vn";
const HR_PASSWORD = "demo123";

test("HR can log in and sees their dashboard with jobs and stats", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("name@company.com").fill(HR_EMAIL);
  await page.getByPlaceholder("••••••••").fill(HR_PASSWORD);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/hr/);
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Danh sách tin tuyển dụng/ })).toBeVisible();
  await expect(page.getByText("Fullstack Developer").first()).toBeVisible();
});

test("HR can create and submit a new job for approval", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("name@company.com").fill(HR_EMAIL);
  await page.getByPlaceholder("••••••••").fill(HR_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/hr/);

  await page.getByRole("link", { name: /Đăng tin mới/ }).click();
  await expect(page).toHaveURL(/\/hr\/jobs\/new/);

  await page.locator('input[name="title"]').fill("Công việc mới từ e2e");
  await page.locator('select[name="category_id"]').selectOption({ index: 1 });
  await page.locator('textarea[name="description"]').fill("Mô tả công việc e2e.");
  await page.locator('textarea[name="requirements"]').fill("Yêu cầu công việc e2e.");

  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/hr/);
  await expect(page.getByText("Công việc mới từ e2e").first()).toBeVisible();
});
