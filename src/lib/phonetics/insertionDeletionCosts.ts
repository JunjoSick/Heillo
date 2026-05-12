import type { GameSettings, PhonemeToken } from "@/lib/types";
import { isSemivowelToken, isVowelToken } from "@/lib/phonetics/tokens";

export function getInsertionCost(
  token: PhonemeToken,
  settings: GameSettings
): number {
  if (isVowelToken(token)) {
    return settings.insertVowelCost;
  }

  if (isSemivowelToken(token)) {
    return settings.insertSemivowelCost;
  }

  return settings.insertConsonantCost;
}

export function getDeletionCost(
  token: PhonemeToken,
  settings: GameSettings
): number {
  if (isVowelToken(token)) {
    return settings.deleteVowelCost;
  }

  if (isSemivowelToken(token)) {
    return settings.deleteSemivowelCost;
  }

  return settings.deleteConsonantCost;
}
