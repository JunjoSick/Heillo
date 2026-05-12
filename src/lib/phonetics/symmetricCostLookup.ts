import type { PhonemeToken } from "@/lib/types";

export function pairKey(a: PhonemeToken | string, b: PhonemeToken | string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function symmetricLookup(
  table: Record<string, number>,
  a: PhonemeToken,
  b: PhonemeToken
): number | undefined {
  if (a === b) {
    return 0;
  }

  return table[pairKey(a, b)];
}

export function createSymmetricCostTable(
  entries: Array<[PhonemeToken | string, PhonemeToken | string, number]>
): Record<string, number> {
  return Object.fromEntries(entries.map(([a, b, cost]) => [pairKey(a, b), cost]));
}
