import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = "admin@remoteit.vn";
const ADMIN_PASSWORD = "admin123";

test("admin can log in and see the overview", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("name@company.com").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("••••••••").fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("heading", { name: /Tổng Quan Quản Trị/ })).toBeVisible();
});

test("admin approves a pending job", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("name@company.com").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("••••••••").fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/pending");
  await expect(page.getByRole("heading", { name: /Tin chờ duyệt/ })).toBeVisible();

  const pendingJob = page.getByText("QA Engineer").first();
  await expect(pendingJob).toBeVisible();

  // Duyệt job → nó không còn trong danh sách chờ duyệt
  await page.getByRole("button", { name: /Phê duyệt/ }).first().click();
  await expect(page.getByText("QA Engineer").first()).toBeHidden();
});
