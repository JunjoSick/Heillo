import type {
  BaseConsonantToken,
  GeminateToken,
  PhonemeToken,
  VowelToken
} from "@/lib/types";
import { PHONETIC_EXCEPTIONS } from "@/lib/phonetics/exceptions";

const VOWEL_CHARS = new Set(["a", "e", "i", "o", "u"]);

const SINGLE_CONSONANTS: Record<string, BaseConsonantToken> = {
  b: "B",
  d: "D",
  f: "F",
  l: "L",
  m: "M",
  n: "N",
  p: "P",
  r: "R",
  s: "S",
  t: "T",
  v: "V",
  z: "Z"
};

const HARD_CONSONANTS: Record<string, BaseConsonantToken> = {
  c: "K",
  g: "G"
};

const GEMINATE_BY_LETTER: Record<string, GeminateToken> = {
  b: "BB",
  c: "KK",
  d: "DD",
  f: "FF",
  g: "GG",
  l: "LL",
  m: "MM",
  n: "NN",
  p: "PP",
  r: "RR",
  s: "SS",
  t: "TT",
  v: "VV",
  z: "ZZ"
};

function isVowelChar(char: string | undefined): boolean {
  return char !== undefined && VOWEL_CHARS.has(char);
}

function vowelToken(char: string): VowelToken {
  return char.toUpperCase() as VowelToken;
}

function isConsonantChar(char: string | undefined): boolean {
  return char !== undefined && /^[a-z]$/u.test(char) && !isVowelChar(char);
}

function pushPlainVowel(
  output: PhonemeToken[],
  word: string,
  index: number
): void {
  const char = word[index];
  const previous = word[index - 1];
  const next = word[index + 1];

  if (char === "i") {
    if (isVowelChar(next) || (isVowelChar(previous) && (!next || isConsonantChar(next)))) {
      output.push("J");
      return;
    }
  }

  if (char === "u") {
    if (isVowelChar(next) || (isVowelChar(previous) && (!next || isConsonantChar(next)))) {
      output.push("W");
      return;
    }
  }

  output.push(vowelToken(char));
}

export function orthographyToGamePhonemes(word: string): PhonemeToken[] {
  const exception = PHONETIC_EXCEPTIONS[word];

  if (exception) {
    return [...exception];
  }

  const output: PhonemeToken[] = [];
  let i = 0;

  while (i < word.length) {
    const char = word[i];
    const next = word[i + 1];
    const afterNext = word[i + 2];

    if (char === "h") {
      i += 1;
      continue;
    }

    if (word.startsWith("sch", i)) {
      output.push("S", "K");
      i += 3;
      continue;
    }

    if (word.startsWith("sc", i)) {
      if (afterNext === "i" && isVowelChar(word[i + 3])) {
        output.push("SC");
        i += 3;
        continue;
      }

      if (afterNext === "e" || afterNext === "i") {
        output.push("SC");
        i += 2;
        continue;
      }

      output.push("S", "K");
      i += 2;
      continue;
    }

    if (word.startsWith("gn", i)) {
      output.push("GN");
      i += 2;
      continue;
    }

    if (word.startsWith("gli", i)) {
      output.push("GL");
      i += isVowelChar(word[i + 3]) ? 3 : 2;
      continue;
    }

    if (word.startsWith("qu", i) && isVowelChar(afterNext)) {
      output.push("K", "W");
      i += 2;
      continue;
    }

    if (char === next && GEMINATE_BY_LETTER[char]) {
      output.push(GEMINATE_BY_LETTER[char]);
      i += 2;
      continue;
    }

    if (char === "c") {
      if (next === "h") {
        output.push("K");
        i += 2;
        continue;
      }

      if (next === "i" && isVowelChar(afterNext)) {
        output.push("CD");
        i += 2;
        continue;
      }

      if (next === "e" || next === "i") {
        output.push("CD");
        i += 1;
        continue;
      }

      output.push("K");
      i += 1;
      continue;
    }

    if (char === "g") {
      if (next === "h") {
        output.push("G");
        i += 2;
        continue;
      }

      if (next === "i" && isVowelChar(afterNext)) {
        output.push("GD");
        i += 2;
        continue;
      }

      if (next === "e" || next === "i") {
        output.push("GD");
        i += 1;
        continue;
      }

      output.push("G");
      i += 1;
      continue;
    }

    if (isVowelChar(char)) {
      pushPlainVowel(output, word, i);
      i += 1;
      continue;
    }

    const simpleConsonant = SINGLE_CONSONANTS[char] ?? HARD_CONSONANTS[char];

    if (simpleConsonant) {
      output.push(simpleConsonant);
    }

    i += 1;
  }

  return output;
}
