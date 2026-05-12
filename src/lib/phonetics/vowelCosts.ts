import type { PhonemeToken } from "@/lib/types";
import { createSymmetricCostTable, symmetricLookup } from "@/lib/phonetics/symmetricCostLookup";

export const VOWEL_COSTS = createSymmetricCostTable([
  ["A", "E", 1],
  ["A", "I", 1.5],
  ["A", "O", 1],
  ["A", "U", 1.5],
  ["E", "I", 1],
  ["E", "O", 1],
  ["E", "U", 1.5],
  ["I", "O", 1.5],
  ["I", "U", 1],
  ["O", "U", 1]
]);

export function getVowelSubstitutionCost(
  a: PhonemeToken,
  b: PhonemeToken
): number | undefined {
  return symmetricLookup(VOWEL_COSTS, a, b);
}
