import { expect, test, type Page } from "@playwright/test";

async function readJsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return blocks.map((block) => JSON.parse(block) as Record<string, unknown>);
}

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

test("home page exposes WebSite JSON-LD with canonical", async ({ page }) => {
  await page.goto("/");
  const blocks = await readJsonLd(page);
  const website = blocks.find((block) => block["@type"] === "WebSite");
  expect(website).toBeTruthy();
  expect(website?.inLanguage).toBe("vi");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/vi$/,
  );
});

test("category page exposes CollectionPage JSON-LD", async ({ page }) => {
  await page.goto("/category/frontend");
  await expect(page.getByRole("heading", { level: 1, name: /Frontend/ })).toBeVisible();
  const blocks = await readJsonLd(page);
  expect(blocks.some((block) => block["@type"] === "CollectionPage")).toBe(true);
  expect(blocks.some((block) => block["@type"] === "BreadcrumbList")).toBe(true);
});

test("job detail exposes JobPosting and Breadcrumb JSON-LD", async ({ page }) => {
  await page.goto("/");
  const href = await page
    .getByRole("link", { name: /Fullstack Developer/ })
    .first()
    .getAttribute("href");
  expect(href).toBeTruthy();
  // Full page load: JSON-LD is emitted in the server-rendered HTML (client-side
  // navigation does not re-inject inline <script> tags).
  await page.goto(href as string);
  await expect(page.getByRole("heading", { name: "Fullstack Developer" })).toBeVisible();

  const blocks = await readJsonLd(page);
  const posting = blocks.find((block) => block["@type"] === "JobPosting");
  expect(posting).toBeTruthy();
  expect(posting?.title).toBe("Fullstack Developer");
  expect(posting?.jobLocationType).toBe("TELECOMMUTE");
  expect(posting?.datePosted).toBeTruthy();
  expect(blocks.some((block) => block["@type"] === "BreadcrumbList")).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/vi\/jobs\/.+/,
  );
});
