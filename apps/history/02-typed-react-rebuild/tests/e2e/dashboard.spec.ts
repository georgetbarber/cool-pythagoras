import { expect, test } from "@playwright/test";

test("explores harmony and navigates to practice", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "C Major" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Matrix" })).toBeVisible();

  await page.getByLabel("Mode").selectOption("dorian");
  await expect(page.getByText("Dorian harmony")).toBeVisible();

  await page.getByRole("button", { name: "Practice Lab" }).click();
  await expect(page.getByRole("heading", { name: "Practice Lab" })).toBeVisible();
});
