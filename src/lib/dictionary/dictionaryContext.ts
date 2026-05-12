import type { DictionaryContext } from "@/lib/types";
import { normalizeWord } from "@/lib/phonetics/normalizeWord";

export interface PreparedDictionaryContext extends DictionaryContext {
  dictionarySet: Set<string>;
  customSet: Set<string>;
  allWords: string[];
}

export function prepareDictionaryContext(
  dictionaryWords: string[],
  customWords: string[]
): PreparedDictionaryContext {
  const dictionarySet = new Set(dictionaryWords.map(normalizeWord));
  const customSet = new Set(customWords.map(normalizeWord));

  return {
    dictionaryWords: dictionarySet,
    customWords: customSet,
    dictionarySet,
    customSet,
    allWords: Array.from(new Set([...dictionarySet, ...customSet])).sort((a, b) =>
      a.localeCompare(b)
    )
  };
}
