export interface ParsedEntry {
  name: string;
  weight: number;
}

const MAX_WEIGHT = 10;

/**
 * "철수, 영희*2\n민수" 형식의 입력을 참가자 목록으로 변환한다.
 * 같은 이름이 여러 번 나오면 가중치를 합산한다.
 */
export function parseParticipants(text: string): ParsedEntry[] {
  const tokens = text
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const merged = new Map<string, number>();
  for (const token of tokens) {
    const match = token.match(/^(.+?)\*(\d+)$/);
    const name = (match ? match[1]! : token).trim();
    if (!name) continue;
    const weight = match ? Math.min(MAX_WEIGHT, Math.max(1, Number(match[2]))) : 1;
    merged.set(name, Math.min(MAX_WEIGHT, (merged.get(name) ?? 0) + weight));
  }

  return [...merged.entries()].map(([name, weight]) => ({ name, weight }));
}

export const MARBLE_COLORS = [
  "#ef5350",
  "#42a5f5",
  "#66bb6a",
  "#ffb300",
  "#ab47bc",
  "#26c6da",
  "#ff7043",
  "#d4e157",
  "#ec407a",
  "#5c6bc0",
  "#9ccc65",
  "#ffca28",
  "#8d6e63",
  "#29b6f6",
  "#ff8a65",
  "#7e57c2",
];

export function colorFor(index: number): string {
  return MARBLE_COLORS[index % MARBLE_COLORS.length]!;
}
