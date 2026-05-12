import { normalizeWord } from "@/lib/phonetics/normalizeWord";

export const CUSTOM_WORDS_STORAGE_KEY = "customAcceptedWords";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function loadCustomWords(): string[] {
  const storage = safeStorage();

  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(CUSTOM_WORDS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    if (Array.isArray(parsed)) {
      return parsed.filter((word): word is string => typeof word === "string");
    }
  } catch {
    return [];
  }

  return [];
}

export function saveCustomWords(words: string[]): void {
  const storage = safeStorage();

  if (!storage) {
    return;
  }

  const uniqueWords = Array.from(
    new Map(words.map((word) => [normalizeWord(word), normalizeWord(word)])).values()
  ).sort((a, b) => a.localeCompare(b));

  storage.setItem(CUSTOM_WORDS_STORAGE_KEY, JSON.stringify(uniqueWords));
}

export function saveCustomWord(word: string): string[] {
  const normalized = normalizeWord(word);
  const words = loadCustomWords();

  if (!words.map(normalizeWord).includes(normalized)) {
    words.push(normalized);
  }

  saveCustomWords(words);
  return loadCustomWords();
}
