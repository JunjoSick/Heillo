import type {
  BaseConsonantToken,
  GeminateToken,
  PhonemeToken,
  SpecialToken,
  VowelToken
} from "@/lib/types";

export const VOWEL_TOKENS: VowelToken[] = ["A", "E", "I", "O", "U"];

export const BASE_CONSONANT_TOKENS: BaseConsonantToken[] = [
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
  "M",
  "N",
  "L",
  "R"
];

export const SPECIAL_TOKENS: SpecialToken[] = [
  "CD",
  "GD",
  "SC",
  "GN",
  "GL",
  "J",
  "W"
];

export const GEMINATE_TOKENS: GeminateToken[] = [
  "PP",
  "BB",
  "TT",
  "DD",
  "KK",
  "GG",
  "FF",
  "VV",
  "SS",
  "ZZ",
  "MM",
  "NN",
  "LL",
  "RR"
];

export const ALL_TOKENS: PhonemeToken[] = [
  ...VOWEL_TOKENS,
  ...BASE_CONSONANT_TOKENS,
  ...SPECIAL_TOKENS,
  ...GEMINATE_TOKENS
];

export const VOWELS = new Set<PhonemeToken>(VOWEL_TOKENS);
export const BASE_CONSONANTS = new Set<PhonemeToken>(BASE_CONSONANT_TOKENS);
export const SPECIALS = new Set<PhonemeToken>(SPECIAL_TOKENS);
export const GEMINATES = new Set<PhonemeToken>(GEMINATE_TOKENS);

export function isVowelToken(token: PhonemeToken): token is VowelToken {
  return VOWELS.has(token);
}

export function isSemivowelToken(token: PhonemeToken): token is "J" | "W" {
  return token === "J" || token === "W";
}

export function isSpecialToken(token: PhonemeToken): token is SpecialToken {
  return SPECIALS.has(token);
}

export function isBaseConsonantToken(
  token: PhonemeToken
): token is BaseConsonantToken {
  return BASE_CONSONANTS.has(token);
}

export function isGeminateToken(token: PhonemeToken): token is GeminateToken {
  return GEMINATES.has(token);
}
