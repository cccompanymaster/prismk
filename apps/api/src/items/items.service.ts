import { Injectable } from "@nestjs/common";
import { getItemsByVersion, type Item } from "@prism-k/data";

function fisherYates<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * Reorders items so no two consecutive items share the same facet.
 * Uses the task-scheduler approach: at each step pick the facet with
 * the highest remaining count that is not the previously placed facet.
 * The pool of items inside each facet bucket is pre-shuffled so the
 * resulting order is randomized while obeying the adjacency constraint.
 *
 * If no two facets share the most-frequent count == ceil(n/2), this is
 * always achievable.
 */
function shuffleAvoidingAdjacency(items: Item[]): Item[] {
  const buckets = new Map<string, Item[]>();
  for (const item of fisherYates(items)) {
    const arr = buckets.get(item.facet);
    if (arr) arr.push(item);
    else buckets.set(item.facet, [item]);
  }

  const result: Item[] = [];
  let lastFacet: string | null = null;

  while (result.length < items.length) {
    let bestFacet: string | null = null;
    let bestCount = 0;
    let fallbackFacet: string | null = null;
    let fallbackCount = 0;

    for (const [facet, arr] of buckets) {
      if (arr.length === 0) continue;
      if (facet === lastFacet) {
        if (arr.length > fallbackCount) {
          fallbackFacet = facet;
          fallbackCount = arr.length;
        }
        continue;
      }
      if (arr.length > bestCount) {
        bestFacet = facet;
        bestCount = arr.length;
      }
    }

    const pickFacet: string | null = bestFacet ?? fallbackFacet;
    if (!pickFacet) break;

    const arr = buckets.get(pickFacet)!;
    const next = arr.pop()!;
    result.push(next);
    lastFacet = pickFacet;
  }

  return result;
}

@Injectable()
export class ItemsService {
  getShuffledItems(version: "lite" | "full"): Item[] {
    const source = getItemsByVersion(version);
    return shuffleAvoidingAdjacency(source);
  }
}
