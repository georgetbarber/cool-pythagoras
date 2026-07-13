import { expect, test, type Page } from "@playwright/test";

async function completeDiagnostic(page: Page) {
  await page.goto("/");
  await expect(page).toHaveTitle("Guitar Academy V8");
  if (await page.getByRole("heading", { name: "Build freedom from sound, time and relationships." }).count()) {
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Start your path" }).click();
  }
  await expect(page.getByRole("heading", { name: "Turn one relationship into music." })).toBeVisible();
}

function learningNav(page: Page) {
  return page.locator(".primary-sidebar nav:visible, .mobile-nav:visible");
}

test("first launch explains the learning contract before entering the app", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Build freedom from sound, time and relationships." })).toBeVisible();
  await expect(page.getByText("48 connected units", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Acoustic/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Early intermediate/ }).click();
    await page.getByRole("button", { name: "Start your path" }).click();
  await expect(page.getByText("acoustic", { exact: true }).first()).toBeVisible();
});

test("navigates five focused destinations with real URL history", async ({ page }) => {
  await completeDiagnostic(page);
  const nav = learningNav(page);
  for (const [label, path] of [["Path", "/path"], ["Practice", "/practice"], ["Create", "/create"], ["Explore", "/explore"], ["Today", "/today"]]) {
    await nav.getByRole("button", { name: new RegExp(label) }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/explore$/);
});

test("records hints separately from independent learning evidence", async ({ page }) => {
  await completeDiagnostic(page);
  await page.getByRole("button", { name: /Start with:/ }).click();
  await page.getByRole("button", { name: "Use a hint" }).click();
  await page.getByRole("button", { name: /Hear (?:reference and target|the tonic reference)/ }).click();
  await page.getByRole("button", { name: "Successful today" }).click();
  const nav = learningNav(page);
  await nav.getByRole("button", { name: /Practice/ }).click();
  await expect(page.getByText(/assisted attempt.*kept separate/).first()).toBeVisible();
  await expect(page.getByText("secure", { exact: true })).toHaveCount(0);
});

test("exposes all eight stages and a complete unit activity contract", async ({ page }) => {
  await completeDiagnostic(page);
  await learningNav(page).getByRole("button", { name: /Path/ }).click();
  await expect(page.getByRole("navigation", { name: "Curriculum stages" }).getByRole("button")).toHaveCount(8);
  await expect(page.locator(".unit-card")).toHaveCount(6);
  await expect(page.locator(".activity-list li")).toHaveCount(9);
  await expect(page.getByText("Make a small musical object", { exact: true })).toBeVisible();
  await expect(page.getByText("Move it somewhere new", { exact: true })).toBeVisible();
});

test("creates, revises, finishes and restores a local musical sketch", async ({ page }) => {
  await completeDiagnostic(page);
  await learningNav(page).getByRole("button", { name: /Create/ }).click();
  await page.getByRole("button", { name: "Start your first sketch" }).click();
  await page.getByLabel("Sketch name").fill("Two-note horizon");
  await page.getByLabel("Add chord").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Change one interval" }).click();
  await expect(page.locator(".revision-count")).toContainText(/1\s*preserved revisions/);
  await page.getByRole("button", { name: "Finish this version" }).click();
  await expect(page.getByText(/creative workflow · finished/i)).toBeVisible();
  await page.waitForTimeout(150);
  await page.reload();
  await expect(page.getByLabel("Sketch name")).toHaveValue("Two-note horizon");
  await expect(page.locator(".revision-count")).toContainText(/2\s*preserved revisions/);
});

test("treats chromatic colour as contextual rather than wrong", async ({ page }) => {
  await completeDiagnostic(page);
  await learningNav(page).getByRole("button", { name: /Explore/ }).click();
  await page.getByRole("button", { name: "Move one semitone" }).click();
  await expect(page.getByText("Chromatic neighbour", { exact: true })).toBeVisible();
  await expect(page.getByText(/Outside does not mean wrong|outside the active reference/i)).toBeVisible();
  await expect(page.getByText(/Compact note layout|Fingering-checked voicing/)).toBeVisible();
});

test("handles denied microphone access without losing a sketch", async ({ page, context }) => {
  await context.clearPermissions();
  await page.addInitScript(() => Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: () => Promise.reject(new DOMException("Permission denied", "NotAllowedError")) } }));
  await completeDiagnostic(page);
  await learningNav(page).getByRole("button", { name: /Create/ }).click();
  await page.getByRole("button", { name: "Start your first sketch" }).click();
  await page.getByRole("button", { name: "Record a temporary take" }).click();
  await expect(page.getByText(/Microphone unavailable/)).toBeVisible();
  await expect(page.getByLabel("Sketch name")).toBeVisible();
});

test("exports a complete local backup", async ({ page }) => {
  await completeDiagnostic(page);
  await page.getByRole("button", { name: /settings and (?:data|sync)/i }).filter({ visible: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export complete backup" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.guitar-academy$/);
  await expect(page.getByText(/Audio is never uploaded or synchronised/)).toBeVisible();
});

test("keeps content first and avoids horizontal page overflow on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await completeDiagnostic(page);
  await expect(page.getByRole("navigation", { name: "Mobile learning navigation" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary learning navigation" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Turn one relationship into music." })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
