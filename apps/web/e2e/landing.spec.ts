import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders hero, differentiators, version cards, FAQ", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /나를 한 글자로/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /기존 성격 검사와 무엇이 다른가요/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /어느 검사를 해보시겠어요/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /자주 묻는 질문/ })).toBeVisible();
  });

  test("CTA buttons route to test pages", async ({ page }) => {
    await page.goto("/");
    const liteLink = page.getByRole("link", { name: /라이트판 시작/ }).first();
    await expect(liteLink).toHaveAttribute("href", "/test/lite");
  });

  test("ethics footer is present and contains the spec phrase", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/채용·인사·결혼 결정에 단독 사용되지 않습니다/),
    ).toBeVisible();
    await expect(page.getByText(/이는 현재의 패턴이며 자라납니다/)).toBeVisible();
  });

  test("axe-core: no critical accessibility violations", async ({ page }) => {
    await page.goto("/");
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const blocking = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking).toEqual([]);
  });
});
