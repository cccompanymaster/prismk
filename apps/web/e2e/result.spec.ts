import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Route } from "@playwright/test";

const TOKEN = "mock-result-token";

const MOCK_RESULT = {
  token: TOKEN,
  version: "lite" as const,
  code: { main: "DI", sub: "SS", display: "DI-SS" },
  patterns: {
    main: {
      id: "DI",
      name: "꿈꾸는 발명가",
      slogan: "아이디어가 비처럼 쏟아져요",
      signature: { color: "#7E57C2", word: "비상", animal: "갈매기" },
    },
    sub: {
      id: "SS",
      name: "섬세한 감응자",
      slogan: "세상의 모든 결을 느껴요",
      signature: { color: "#EC407A", word: "프리즘", animal: "사슴" },
    },
  },
  matches: [],
  facets: [
    { facet: "O1_상상력", dim: "O", raw: 5, standardized: 1.5, tScore: 65 },
    { facet: "C2_근면성", dim: "C", raw: 3, standardized: -0.5, tScore: 45 },
  ],
  dimensions: [
    { dim: "O", raw: 5, standardized: 1.5, tScore: 65, ci: { low: 56, high: 74 } },
    { dim: "C", raw: 3, standardized: -0.5, tScore: 45, ci: { low: 36, high: 54 } },
    { dim: "E", raw: 4, standardized: 0.5, tScore: 55, ci: { low: 46, high: 64 } },
    { dim: "A", raw: 4, standardized: 0.5, tScore: 55, ci: { low: 46, high: 64 } },
    { dim: "ES", raw: 3.5, standardized: 0, tScore: 50, ci: { low: 41, high: 59 } },
    { dim: "HH", raw: 4, standardized: 0.5, tScore: 55, ci: { low: 46, high: 64 } },
  ],
  auxiliary: [
    { code: "V", raw: 4, message: null },
    { code: "G", raw: 4, message: null },
  ],
  stressPatterns: [
    { code: "S1", raw: 3, dominant: false },
    { code: "S2", raw: 3, dominant: false },
    { code: "S3", raw: 3, dominant: false },
    { code: "S4", raw: 3, dominant: false },
    { code: "S5", raw: 3, dominant: false },
  ],
  quality: { missing: "normal", variance: "normal", speed: "normal", extreme: "normal" },
  riskSignals: [],
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
};

async function mockResult(page: import("@playwright/test").Page): Promise<void> {
  await page.route(`**/__mocked__/api/results/${TOKEN}`, (route: Route) =>
    route.fulfill({
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(MOCK_RESULT),
    }),
  );
}

test.describe("/result/[token]", () => {
  test("renders hero with display code + main name + slogan", async ({ page }) => {
    await mockResult(page);
    await page.goto(`/result/${TOKEN}`);
    await expect(page.getByRole("heading", { name: "DI-SS" })).toBeVisible();
    await expect(page.getByText("꿈꾸는 발명가", { exact: false })).toBeVisible();
    await expect(page.getByText(/아이디어가 비처럼 쏟아져요/)).toBeVisible();
  });

  test("8 result sections are present in the accordion", async ({ page }) => {
    await mockResult(page);
    await page.goto(`/result/${TOKEN}`);
    for (let i = 1; i <= 8; i++) {
      await expect(page.getByText(`섹션 ${i}`)).toBeVisible();
    }
  });

  test("share buttons render the 3 download formats", async ({ page }) => {
    await mockResult(page);
    await page.goto(`/result/${TOKEN}`);
    await expect(page.getByRole("link", { name: /정사각형 \(1080×1080\)/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /스토리 \(1080×1920\)/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /카톡 \(720×900\)/ })).toBeVisible();
  });

  test("ethics phrase is rendered on the result page", async ({ page }) => {
    await mockResult(page);
    await page.goto(`/result/${TOKEN}`);
    await expect(page.getByText(/이는 현재의 패턴이며 자라납니다/).first()).toBeVisible();
  });

  test("axe-core: no critical accessibility violations on result page", async ({ page }) => {
    await mockResult(page);
    await page.goto(`/result/${TOKEN}`);
    const a = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const blocking = a.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking).toEqual([]);
  });
});
