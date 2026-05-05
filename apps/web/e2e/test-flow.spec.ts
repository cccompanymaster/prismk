import { expect, test, type Route } from "@playwright/test";
import { items } from "@prism-k/data";

const LITE_ITEMS = items.filter((i) => i.lite);

async function mockApi(page: import("@playwright/test").Page): Promise<void> {
  await page.route("**/__mocked__/api/items**", (route: Route) => {
    return route.fulfill({
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ version: "lite", items: LITE_ITEMS }),
    });
  });
  await page.route("**/__mocked__/api/responses", (route: Route) => {
    return route.fulfill({
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "mocked-test-token" }),
    });
  });
}

test.describe("/test/lite runner", () => {
  test("renders progress bar + first batch of items", async ({ page }) => {
    await mockApi(page);
    await page.goto("/test/lite");
    await expect(page.getByText(/응답 척도/)).toBeVisible();
    const firstQuestion = page.locator("li").first();
    await expect(firstQuestion).toContainText(/Q1\./);
  });

  test("next button is disabled until all items on the page are answered", async ({ page }) => {
    await mockApi(page);
    await page.goto("/test/lite");
    const nextButton = page.getByRole("button", { name: "다음" });
    await expect(nextButton).toBeDisabled();
  });

  test("draft is restored from localStorage on reload", async ({ page }) => {
    await mockApi(page);
    await page.goto("/test/lite");
    // Answer the first question with value 4
    const firstRadioGroup = page.getByRole("radiogroup").first();
    await firstRadioGroup.getByRole("radio", { name: "4" }).click();
    await expect(page.locator("text=1 / 9").first()).toBeVisible();
    // Reload — draft should restore the answer.
    await page.reload();
    const restored = page.getByRole("radiogroup").first().getByRole("radio", { name: "4" });
    await expect(restored).toHaveAttribute("aria-checked", "true");
  });
});
