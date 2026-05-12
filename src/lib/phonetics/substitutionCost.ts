import type { GameSettings, PhonemeToken } from "@/lib/types";
import { getBaseConsonantSubstitutionCost } from "@/lib/phonetics/consonantCosts";
import { getLengthFeature } from "@/lib/phonetics/geminates";
import { getSpecialSubstitutionCost } from "@/lib/phonetics/specialCosts";
import { isSpecialToken, isVowelToken } from "@/lib/phonetics/tokens";
import { getVowelSubstitutionCost } from "@/lib/phonetics/vowelCosts";

export function getSubstitutionCost(
  a: PhonemeToken,
  b: PhonemeToken,
  settings: GameSettings
): number {
  if (a === b) {
    return 0;
  }

  if (isVowelToken(a) && isVowelToken(b)) {
    return getVowelSubstitutionCost(a, b) ?? settings.specialFallbackCost;
  }

  const aLength = getLengthFeature(a);
  const bLength = getLengthFeature(b);

  if (aLength && bLength) {
    const baseCost =
      getBaseConsonantSubstitutionCost(aLength.base, bLength.base) ??
      settings.specialFallbackCost;
    const lengthCost =
      aLength.long === bLength.long ? 0 : settings.lengthMismatchCost;

    return baseCost + lengthCost;
  }

  const specialCost = getSpecialSubstitutionCost(a, b);

  if (specialCost !== undefined) {
    return specialCost;
  }

  if (isSpecialToken(a) || isSpecialToken(b)) {
    return settings.specialFallbackCost;
  }

  return settings.specialFallbackCost;
}
