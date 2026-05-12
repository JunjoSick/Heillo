import type { BaseConsonantToken, PhonemeToken } from "@/lib/types";
import { createSymmetricCostTable, symmetricLookup } from "@/lib/phonetics/symmetricCostLookup";

const rows: Record<BaseConsonantToken, Partial<Record<BaseConsonantToken, number>>> = {
  P: { B: 1, T: 1.5, D: 2, K: 1.5, G: 2, F: 1.5, V: 2, S: 2, Z: 2.5, M: 1.5, N: 2, L: 2.5, R: 2.5 },
  B: { T: 2, D: 1.5, K: 2, G: 1.5, F: 2, V: 1.5, S: 2.5, Z: 2, M: 1.5, N: 2, L: 2.5, R: 2.5 },
  T: { D: 1, K: 1.5, G: 2, F: 2, V: 2.5, S: 1.5, Z: 2, M: 2, N: 1.5, L: 2, R: 2 },
  D: { K: 2, G: 1.5, F: 2.5, V: 2, S: 2, Z: 1.5, M: 2, N: 1.5, L: 2, R: 2 },
  K: { G: 1, F: 2.5, V: 2.5, S: 2, Z: 2.5, M: 2.5, N: 2.5, L: 2.5, R: 2.5 },
  G: { F: 2.5, V: 2.5, S: 2.5, Z: 2, M: 2.5, N: 2.5, L: 2.5, R: 2.5 },
  F: { V: 1, S: 1.5, Z: 2, M: 2, N: 2.5, L: 2.5, R: 2.5 },
  V: { S: 2, Z: 1.5, M: 2, N: 2.5, L: 2.5, R: 2.5 },
  S: { Z: 1, M: 2.5, N: 2, L: 2, R: 2 },
  Z: { M: 2.5, N: 2, L: 2, R: 2 },
  M: { N: 1, L: 2, R: 2 },
  N: { L: 1.5, R: 1.5 },
  L: { R: 1 },
  R: {}
};

export const BASE_CONSONANT_COSTS = createSymmetricCostTable(
  Object.entries(rows).flatMap(([from, targets]) =>
    Object.entries(targets).map(([to, cost]) => [
      from,
      to,
      cost
    ] as [BaseConsonantToken, BaseConsonantToken, number])
  )
);

export function getBaseConsonantSubstitutionCost(
  a: PhonemeToken,
  b: PhonemeToken
): number | undefined {
  return symmetricLookup(BASE_CONSONANT_COSTS, a, b);
}
