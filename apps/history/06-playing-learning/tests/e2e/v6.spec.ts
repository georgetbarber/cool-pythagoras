import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Guitar Academy V6");
});

test("navigates every learning workspace without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const label of [
    "Learn", "Explore", "Fretboard", "Harmony", "Progressions",
    "Ear", "Practice", "Play Lab", "Play Along", "My Path", "Dashboard"
  ]) {
    await page.getByRole("button", { name: new RegExp(label) }).first().click();
    await expect(page.locator(".workspace-header")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("reveals the tonal setup only when requested", async ({ page }) => {
  await expect(page.getByLabel("Tonal centre")).toHaveCount(0);
  await page.getByRole("button", { name: "Change study setup" }).click();
  await expect(page.getByLabel("Tonal centre")).toBeVisible();
  await page.getByLabel("Tonal centre").selectOption("D");
  await expect(page.getByText("D Major", { exact: true })).toBeVisible();
});

test("builds, identifies, hears, and saves an open C shape", async ({ page }) => {
  await page.getByRole("button", { name: /Play Lab/ }).click();
  await page.getByRole("button", { name: "Clear shape" }).click();
  for (const [string, fret] of [[1, 0], [2, 1], [3, 0], [4, 2], [5, 3]]) {
    await page.getByTestId(`shape-string-${string}-fret-${fret}`).click();
  }
  await expect(page.locator(".discovery-result h2")).toHaveText("C");
  await expect(page.getByText("I · Home", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add this shape to progression" }).click();
  await expect(page.locator(".custom-progression h2")).toContainText("C");
  await page.getByRole("button", { name: "Play at 72 BPM" }).click();
});

test("inspects the modal bVII chord in the rock progression", async ({ page }) => {
  await page.getByRole("button", { name: /Progressions/ }).click();
  await page.getByRole("button", { name: /Rock Mixolydian rock/ }).click();
  await page.locator(".progression-timeline .timeline-main").nth(1).click();
  await expect(page.locator(".chord-inspector h2")).toContainText("bVII");
  await expect(page.locator(".chord-inspector")).toContainText("Bb");
  await expect(page.locator(".chord-inspector")).toContainText("Mixolydian");
});

test("explains microphone denial without breaking the Play Lab", async ({ page, context }) => {
  await context.clearPermissions();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: () => Promise.reject(new DOMException("Permission denied", "NotAllowedError"))
      }
    });
  });
  await page.reload();
  await page.getByRole("button", { name: /Play Lab/ }).click();
  await page.getByRole("button", { name: "Enable microphone" }).click();
  await expect(page.locator(".performance-coach .feedback")).toContainText("Microphone unavailable");
  await expect(page.locator(".shape-input")).toBeVisible();
});

test("keeps the primary learning controls usable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: /Play Lab/ }).click();
  await expect(page.locator(".shape-input")).toBeVisible();
  await expect(page.getByRole("button", { name: "Load open C example" })).toBeVisible();
  await page.getByRole("button", { name: "Load open C example" }).click();
  await expect(page.locator(".discovery-result h2")).toHaveText("C");
});
