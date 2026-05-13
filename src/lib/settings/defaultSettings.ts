import type { GameSettings } from "@/lib/types";

export const defaultSettings: GameSettings = {
  smoothMax: 1.0,
  validMax: 2.0,
  borderlineMax: 3.5,

  insertVowelCost: 1.5,
  deleteVowelCost: 1.5,

  insertSemivowelCost: 1.5,
  deleteSemivowelCost: 1.5,

  insertConsonantCost: 2.0,
  deleteConsonantCost: 2.0,

  lengthMismatchCost: 1.0,
  specialFallbackCost: 2.5,

  swapBaseCost: 1.5,
  swapVowelLiquidCost: 1.25,
  swapVowelSemivowelCost: 1.25,
  swapVowelNasalCost: 1.5,
  swapVowelObstruentCost: 2.0,
  swapSameBroadClassCost: 1.5,
  swapSpecialPenalty: 0.5,

  maxCompoundStreak: 2,
  allowHomophoneMoves: true
};
