import { expect, test } from "@playwright/test";

test("login as admin shows admin dashboard", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("name@company.com").fill("admin@remoteit.vn");
  await page.getByPlaceholder("••••••••").fill("admin123");
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("heading", { name: /Tổng Quan Quản Trị/ })).toBeVisible();
});

test("login as HR shows HR dashboard", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("name@company.com").fill("demo.hr@remoteit.vn");
  await page.getByPlaceholder("••••••••").fill("demo123");
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/hr/);
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
});

test("login with wrong password shows error", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("name@company.com").fill("admin@remoteit.vn");
  await page.getByPlaceholder("••••••••").fill("wrongpass");
  await page.locator('button[type="submit"]').click();

  await expect(page.getByText(/Email hoặc mật khẩu không đúng/)).toBeVisible();
});

test("protected route redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});
