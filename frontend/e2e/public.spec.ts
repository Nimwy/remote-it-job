import { expect, test } from "@playwright/test";

test("home page shows featured jobs", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Remote IT/);
  await expect(page.getByRole("heading", { name: /Việc làm nổi bật/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Fullstack Developer/ }).first()).toBeVisible();
});

test("job search works", async ({ page }) => {
  await page.goto("/jobs");
  await page.getByPlaceholder("Tìm kiếm công việc...").fill("React");
  await page.getByRole("button", { name: "Tìm kiếm" }).click();
  await expect(page.getByText("React Developer").first()).toBeVisible();
});

test("job detail shows description and contacts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Fullstack Developer/ }).first().click();
  await expect(page.getByRole("heading", { name: "Fullstack Developer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mô tả công việc" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Liên hệ ứng tuyển" })).toBeVisible();
});

test("category page lists jobs", async ({ page }) => {
  await page.goto("/category/frontend");
  await expect(page.getByRole("heading", { level: 1, name: /Frontend/ })).toBeVisible();
});

test("tag page lists jobs", async ({ page }) => {
  await page.goto("/tag/react");
  await expect(page.getByRole("heading", { level: 1, name: /React/ })).toBeVisible();
});

test("language switch to English", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Việc làm nổi bật/ })).toBeVisible();

  await page.getByRole("button", { name: "en", exact: true }).click();
  await expect(page).toHaveURL(/\/en/);
  await expect(page.getByRole("heading", { name: /Featured Jobs/ })).toBeVisible();
});
