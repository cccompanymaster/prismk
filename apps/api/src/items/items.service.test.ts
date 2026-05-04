import { describe, expect, it } from "vitest";
import { ItemsService } from "./items.service";

const service = new ItemsService();

describe("ItemsService.getShuffledItems", () => {
  it("returns 36 items for lite version", () => {
    const items = service.getShuffledItems("lite");
    expect(items).toHaveLength(36);
  });

  it("returns 136 items for full version", () => {
    const items = service.getShuffledItems("full");
    expect(items).toHaveLength(136);
  });

  it("avoids adjacent items sharing the same facet (lite)", () => {
    for (let i = 0; i < 30; i++) {
      const items = service.getShuffledItems("lite");
      for (let j = 1; j < items.length; j++) {
        expect(items[j]!.facet, `attempt ${i}, idx ${j}`).not.toBe(
          items[j - 1]!.facet,
        );
      }
    }
  });

  it("avoids adjacent items sharing the same facet (full)", () => {
    for (let i = 0; i < 10; i++) {
      const items = service.getShuffledItems("full");
      for (let j = 1; j < items.length; j++) {
        expect(items[j]!.facet, `attempt ${i}, idx ${j}`).not.toBe(
          items[j - 1]!.facet,
        );
      }
    }
  });

  it("preserves the full set of items (no duplicates, no missing)", () => {
    const items = service.getShuffledItems("full");
    const ids = new Set(items.map((i) => i.id));
    expect(ids.size).toBe(136);
  });

  it("changes order between calls (with very high probability)", () => {
    const a = service.getShuffledItems("full").map((i) => i.id);
    const b = service.getShuffledItems("full").map((i) => i.id);
    const same = a.every((id, idx) => id === b[idx]);
    expect(same).toBe(false);
  });
});
