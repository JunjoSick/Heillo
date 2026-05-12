const UNSUPPORTED_WORD_PATTERN = /[\s'’ʼ`´-]/u;
const SUPPORTED_WORD_PATTERN = /^[a-z]+$/u;

export function normalizeWord(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function casefoldTrim(input: string): string {
  return input.trim().toLowerCase();
}

export function getUnsupportedWordReason(input: string): string | null {
  const normalized = normalizeWord(input);

  if (!normalized) {
    return "Enter a single Italian word.";
  }

  if (UNSUPPORTED_WORD_PATTERN.test(input) || UNSUPPORTED_WORD_PATTERN.test(normalized)) {
    return "Apostrophes and multiword expressions are not supported in v0. Use a single plain word.";
  }

  if (!SUPPORTED_WORD_PATTERN.test(normalized)) {
    return "Only single Italian words using plain letters are supported in v0.";
  }

  return null;
}

export function isSupportedSingleWord(input: string): boolean {
  return getUnsupportedWordReason(input) === null;
}
