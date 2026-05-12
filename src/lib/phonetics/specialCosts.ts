import type { PhonemeToken } from "@/lib/types";
import { createSymmetricCostTable, symmetricLookup } from "@/lib/phonetics/symmetricCostLookup";

export const SPECIAL_COSTS = createSymmetricCostTable([
  ["CD", "GD", 1],
  ["CD", "SC", 1.5],
  ["GD", "SC", 2],
  ["GN", "N", 1.5],
  ["GN", "M", 2],
  ["GL", "L", 1.5],
  ["GL", "R", 2],
  ["SC", "S", 1.5],
  ["CD", "T", 2],
  ["GD", "D", 2],
  ["J", "W", 1.5],
  ["J", "I", 1],
  ["J", "E", 1.5],
  ["J", "A", 2],
  ["J", "O", 2.5],
  ["J", "U", 2],
  ["W", "U", 1],
  ["W", "O", 1.5],
  ["W", "A", 2],
  ["W", "E", 2.5],
  ["W", "I", 2]
]);

export function getSpecialSubstitutionCost(
  a: PhonemeToken,
  b: PhonemeToken
): number | undefined {
  return symmetricLookup(SPECIAL_COSTS, a, b);
}
