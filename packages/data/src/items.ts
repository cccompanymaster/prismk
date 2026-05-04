import itemsData from "../data/items.json" with { type: "json" };

export const DIMENSION_CODES = ["O", "C", "E", "A", "ES", "HH"] as const;
export type DimensionCode = (typeof DIMENSION_CODES)[number];

export const AUXILIARY_CODES = ["V", "S", "G"] as const;
export type AuxiliaryCode = (typeof AUXILIARY_CODES)[number];

export type AnyDimensionCode = DimensionCode | AuxiliaryCode;

export interface Item {
  id: number;
  dim: AnyDimensionCode;
  facet: string;
  text: string;
  reverse: boolean;
  lite: boolean;
}

export interface DimensionMeta {
  name: string;
  nameEn: string;
  facets?: string[];
  auxiliary?: boolean;
  patterns?: string[];
}

export interface ScaleMeta {
  type: string;
  labels: Record<string, string>;
}

export interface ItemsFile {
  version: string;
  description: string;
  scale: ScaleMeta;
  dimensions: Record<AnyDimensionCode, DimensionMeta>;
  items: Item[];
}

const file = itemsData as ItemsFile;

export const itemsFile: ItemsFile = file;
export const items: Item[] = file.items;
export const dimensions = file.dimensions;
export const scale = file.scale;

export const LITE_ITEM_COUNT = 36;
export const FULL_ITEM_COUNT = 136;

export function getItemsByVersion(version: "lite" | "full"): Item[] {
  return version === "lite" ? items.filter((i) => i.lite) : items;
}

export function getItemsByDimension(dim: AnyDimensionCode): Item[] {
  return items.filter((i) => i.dim === dim);
}

export function getItemsByFacet(facet: string): Item[] {
  return items.filter((i) => i.facet === facet);
}
