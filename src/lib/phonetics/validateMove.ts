import type {
  DictionaryContext,
  GameSettings,
  LexicalStatus,
  MoveClass,
  MoveValidation,
  PhoneticWord
} from "@/lib/types";
import {
  casefoldTrim,
  getUnsupportedWordReason,
  normalizeWord
} from "@/lib/phonetics/normalizeWord";
import { orthographyToGamePhonemes } from "@/lib/phonetics/orthographyToGamePhonemes";
import {
  weightedEditDistance,
  type WeightedEditDistanceResult
} from "@/lib/phonetics/weightedEditDistance";

export function classifyMove(cost: number, settings: GameSettings): MoveClass {
  if (cost <= settings.smoothMax) {
    return "smooth";
  }

  if (cost <= settings.validMax) {
    return "valid";
  }

  if (cost <= settings.borderlineMax) {
    return "borderline";
  }

  return "invalid";
}

export function makePhoneticWord(raw: string): PhoneticWord {
  const normalized = normalizeWord(raw);

  return {
    raw,
    normalized,
    phonemes: orthographyToGamePhonemes(normalized)
  };
}

function toNormalizedSet(words: Iterable<string> | undefined): Set<string> {
  const result = new Set<string>();

  if (!words) {
    return result;
  }

  for (const word of words) {
    result.add(normalizeWord(word));
  }

  return result;
}

export function getLexicalStatus(
  toWord: string,
  dictionaryContext?: DictionaryContext
): LexicalStatus {
  const normalized = normalizeWord(toWord);
  const dictionary = toNormalizedSet(dictionaryContext?.dictionaryWords);
  const custom = toNormalizedSet(dictionaryContext?.customWords);

  if (dictionary.has(normalized)) {
    return {
      toWordInDictionary: true,
      source: "dictionary"
    };
  }

  if (custom.has(normalized)) {
    return {
      toWordInDictionary: true,
      source: "local-override"
    };
  }

  return {
    toWordInDictionary: false,
    source: "missing"
  };
}

export function buildMoveValidation(
  from: PhoneticWord,
  to: PhoneticWord,
  settings: GameSettings,
  dictionaryContext: DictionaryContext | undefined,
  distance: WeightedEditDistanceResult
): MoveValidation {
  const moveClass = classifyMove(distance.cost, settings);
  const phoneticValid = moveClass !== "invalid";
  const meaningfulChangeCount = distance.changes.filter((change) => change.cost > 0).length;
  const isCompound = meaningfulChangeCount > 1;
  const zeroDistance = distance.cost === 0;
  const sameOrthographicWord = casefoldTrim(from.raw) === casefoldTrim(to.raw);
  const homophoneMove = zeroDistance && !sameOrthographicWord;
  const lexical = getLexicalStatus(to.raw, dictionaryContext);
  let acceptAsProgress = false;

  if (sameOrthographicWord) {
    acceptAsProgress = false;
  } else if (homophoneMove) {
    acceptAsProgress = settings.allowHomophoneMoves;
  } else {
    acceptAsProgress = phoneticValid;
  }

  const explanation = zeroDistance
    ? homophoneMove
      ? "Homophone move: different spelling, same game phonetics."
      : "No-op: same spelling and same game phonetics."
    : `${moveClass}: cost ${distance.cost} with ${meaningfulChangeCount} meaningful change${
        meaningfulChangeCount === 1 ? "" : "s"
      }.`;

  return {
    from,
    to,
    cost: distance.cost,
    class: moveClass,
    phoneticValid,
    changes: distance.changes,
    explanation,
    meaningfulChangeCount,
    isCompound,
    zeroDistance,
    sameOrthographicWord,
    homophoneMove,
    acceptAsProgress,
    lexical,
    alignment: distance.alignment
  };
}

function invalidMove(
  fromWord: string,
  toWord: string,
  reason: string,
  settings: GameSettings,
  dictionaryContext?: DictionaryContext
): MoveValidation {
  const from: PhoneticWord = {
    raw: fromWord,
    normalized: normalizeWord(fromWord),
    phonemes: []
  };
  const to: PhoneticWord = {
    raw: toWord,
    normalized: normalizeWord(toWord),
    phonemes: []
  };

  return {
    from,
    to,
    cost: Infinity,
    class: "invalid",
    phoneticValid: false,
    changes: [],
    explanation: reason,
    meaningfulChangeCount: 0,
    isCompound: false,
    zeroDistance: false,
    sameOrthographicWord: casefoldTrim(fromWord) === casefoldTrim(toWord),
    homophoneMove: false,
    acceptAsProgress: false,
    lexical: getLexicalStatus(toWord, dictionaryContext),
    alignment: null
  };
}

export function validateMove(
  fromWord: string,
  toWord: string,
  settings: GameSettings,
  dictionaryContext?: DictionaryContext,
  options: { maxCost?: number } = {}
): MoveValidation {
  const fromUnsupported = getUnsupportedWordReason(fromWord);
  const toUnsupported = getUnsupportedWordReason(toWord);

  if (fromUnsupported) {
    return invalidMove(fromWord, toWord, fromUnsupported, settings, dictionaryContext);
  }

  if (toUnsupported) {
    return invalidMove(fromWord, toWord, toUnsupported, settings, dictionaryContext);
  }

  const from = makePhoneticWord(fromWord);
  const to = makePhoneticWord(toWord);
  const distance = weightedEditDistance(from.phonemes, to.phonemes, settings, options);

  return buildMoveValidation(from, to, settings, dictionaryContext, distance);
}
