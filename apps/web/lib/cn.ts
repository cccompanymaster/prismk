import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class-name combiner: handles conditional classes (clsx) and resolves
 * Tailwind utility conflicts so a downstream override always wins.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
