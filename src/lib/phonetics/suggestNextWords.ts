import type {
  DictionaryContext,
  GameSettings,
  PhonemeToken,
  Suggestion
} from "@/lib/types";
import {
  getUnsupportedWordReason,
  normalizeWord
} from "@/lib/phonetics/normalizeWord";
import { orthographyToGamePhonemes } from "@/lib/phonetics/orthographyToGamePhonemes";
import {
  buildMoveValidation,
  makePhoneticWord
} from "@/lib/phonetics/validateMove";
import { weightedEditDistance } from "@/lib/phonetics/weightedEditDistance";

const classPriority = {
  smooth: 0,
  valid: 1,
  borderline: 2,
  invalid: 3
};

const transcriptionCache = new Map<string, PhonemeToken[]>();

function transcribeCached(word: string): PhonemeToken[] {
  const normalized = normalizeWord(word);
  const cached = transcriptionCache.get(normalized);

  if (cached) {
    return cached;
  }

  const phonemes = orthographyToGamePhonemes(normalized);
  transcriptionCache.set(normalized, phonemes);
  return phonemes;
}

export function getMaxLengthDelta(settings: GameSettings): number {
  const minInsertCost = Math.min(
    settings.insertVowelCost,
    settings.insertSemivowelCost,
    settings.insertConsonantCost
  );

  return Math.floor(settings.borderlineMax / minInsertCost);
}

export function suggestNextWords(
  currentWord: string,
  dictionary: string[],
  settings: GameSettings,
  dictionaryContext?: DictionaryContext
): Suggestion[] {
  if (getUnsupportedWordReason(currentWord)) {
    return [];
  }

  const from = makePhoneticWord(currentWord);
  const maxLengthDelta = getMaxLengthDelta(settings);
  const seen = new Set<string>();
  const suggestions: Suggestion[] = [];
  const context = dictionaryContext ?? { dictionaryWords: dictionary };

  for (const candidate of dictionary) {
    const normalized = normalizeWord(candidate);

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);

    if (
      normalized === from.normalized ||
      getUnsupportedWordReason(candidate) ||
      Math.abs(from.phonemes.length - transcribeCached(candidate).length) > maxLengthDelta
    ) {
      continue;
    }

    const candidatePhonemes = transcribeCached(candidate);
    const distance = weightedEditDistance(from.phonemes, candidatePhonemes, settings, {
      maxCost: settings.borderlineMax
    });

    if (!Number.isFinite(distance.cost)) {
      continue;
    }

    const to = {
      raw: candidate,
      normalized,
      phonemes: candidatePhonemes
    };
    const validation = buildMoveValidation(from, to, settings, context, distance);

    if (validation.class !== "invalid") {
      suggestions.push({
        word: candidate,
        phonemes: candidatePhonemes,
        validation
      });
    }
  }

  return suggestions
    .sort((a, b) => {
      const classDifference =
        classPriority[a.validation.class] - classPriority[b.validation.class];

      if (classDifference !== 0) {
        return classDifference;
      }

      if (a.validation.cost !== b.validation.cost) {
        return a.validation.cost - b.validation.cost;
      }

      if (a.validation.meaningfulChangeCount !== b.validation.meaningfulChangeCount) {
        return (
          a.validation.meaningfulChangeCount - b.validation.meaningfulChangeCount
        );
      }

      if (a.word.length !== b.word.length) {
        return a.word.length - b.word.length;
      }

      return a.word.localeCompare(b.word);
    })
    .slice(0, 20);
}
