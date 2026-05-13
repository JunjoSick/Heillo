import type { GameSettings, PhonemeToken } from "@/lib/types";
import { isGeminateToken, isVowelToken } from "@/lib/phonetics/tokens";

const liquids = new Set<PhonemeToken>(["L", "R", "GL"]);
const nasals = new Set<PhonemeToken>(["M", "N", "GN"]);
const semivowels = new Set<PhonemeToken>(["J", "W"]);
const penaltySpecials = new Set<PhonemeToken>(["CD", "GD", "SC", "GN", "GL"]);
const obstruents = new Set<PhonemeToken>([
  "P",
  "B",
  "T",
  "D",
  "K",
  "G",
  "F",
  "V",
  "S",
  "Z",
  "CD",
  "GD",
  "SC"
]);

export function getSwapCost(
  a: PhonemeToken,
  b: PhonemeToken,
  settings: GameSettings
): number | null {
  if (a === b) {
    return null;
  }

  let cost = settings.swapBaseCost;

  if (oneIsVowelAndOtherIs(a, b, liquids)) {
    cost = settings.swapVowelLiquidCost;
  } else if (oneIsVowelAndOtherIs(a, b, semivowels)) {
    cost = settings.swapVowelSemivowelCost;
  } else if (oneIsVowelAndOtherIs(a, b, nasals)) {
    cost = settings.swapVowelNasalCost;
  } else if (oneIsVowelAndOtherIs(a, b, obstruents)) {
    cost = settings.swapVowelObstruentCost;
  } else if (sameBroadClass(a, b)) {
    cost = settings.swapSameBroadClassCost;
  }

  if (
    penaltySpecials.has(a) ||
    penaltySpecials.has(b) ||
    isGeminateToken(a) ||
    isGeminateToken(b)
  ) {
    cost += settings.swapSpecialPenalty;
  }

  return cost;
}

function oneIsVowelAndOtherIs(
  a: PhonemeToken,
  b: PhonemeToken,
  tokens: Set<PhonemeToken>
): boolean {
  return (isVowelToken(a) && tokens.has(b)) || (isVowelToken(b) && tokens.has(a));
}

function sameBroadClass(a: PhonemeToken, b: PhonemeToken): boolean {
  return (
    (isVowelToken(a) && isVowelToken(b)) ||
    (liquids.has(a) && liquids.has(b)) ||
    (nasals.has(a) && nasals.has(b)) ||
    (semivowels.has(a) && semivowels.has(b)) ||
    (obstruents.has(a) && obstruents.has(b))
  );
}
