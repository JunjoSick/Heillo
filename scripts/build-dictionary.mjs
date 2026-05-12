import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_BASE =
  "https://raw.githubusercontent.com/franfranz/Word_Frequency_Lists_ITA/main";

const SOURCES = [
  `${SOURCE_BASE}/itwac_nouns_lemmas_notail_2_0_0.csv`,
  `${SOURCE_BASE}/itwac_verbs_lemmas_notail_2_1_0.csv`,
  `${SOURCE_BASE}/itwac_adj_lemmas_notail_2_1_0.csv`
];

const CANONICAL_WORDS = [
  "gioco",
  "geco",
  "scena",
  "schema",
  "schiena",
  "piano",
  "pieno",
  "chiave",
  "quadro",
  "quasi",
  "mai",
  "lei",
  "poi",
  "noi",
  "sei",
  "auto",
  "pala",
  "palla",
  "pila",
  "mamma",
  "manna",
  "gnomo",
  "bagno",
  "figlio",
  "aglio",
  "ho",
  "o",
  "hanno",
  "anno",
  "però",
  "pero",
  "cane",
  "pane",
  "cena",
  "gelo",
  "gatto",
  "ghetto",
  "sciame",
  "fatto",
  "fato"
];

const TARGET_SIZE = 10000;

function normalizeWord(input) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function isSupportedWord(input) {
  const normalized = normalizeWord(input);
  return /^[a-z]+$/u.test(normalized) && !/[\s'’ʼ`´-]/u.test(input);
}

function detectDelimiter(header) {
  const candidates = ["\t", ";", ","];
  return candidates
    .map((delimiter) => ({
      delimiter,
      count: header.split(delimiter).length
    }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function splitCsvLine(line, delimiter) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function findColumn(headers, candidates, fallbackIndex) {
  const lowered = headers.map((header) => header.trim().toLowerCase());

  for (const candidate of candidates) {
    const index = lowered.findIndex((header) => header === candidate);

    if (index >= 0) {
      return index;
    }
  }

  return fallbackIndex;
}

async function fetchText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  return response.text();
}

async function main() {
  const frequencyByWord = new Map();

  for (const source of SOURCES) {
    const csv = await fetchText(source);
    const lines = csv.split(/\r?\n/u).filter(Boolean);
    const delimiter = detectDelimiter(lines[0]);
    const headers = splitCsvLine(lines[0], delimiter);
    const wordIndex = findColumn(headers, ["wordform", "word", "form"], 0);
    const frequencyIndex = findColumn(headers, ["frequency", "freq", "raw"], 3);

    for (const line of lines.slice(1)) {
      const columns = splitCsvLine(line, delimiter);
      const rawWord = columns[wordIndex]?.trim();
      const frequency = Number.parseFloat(columns[frequencyIndex] ?? "0");

      if (!rawWord || !isSupportedWord(rawWord)) {
        continue;
      }

      const normalized = normalizeWord(rawWord);
      frequencyByWord.set(
        normalized,
        (frequencyByWord.get(normalized) ?? 0) + (Number.isFinite(frequency) ? frequency : 0)
      );
    }
  }

  for (const word of CANONICAL_WORDS) {
    if (isSupportedWord(word)) {
      const normalized = normalizeWord(word);
      frequencyByWord.set(normalized, Math.max(frequencyByWord.get(normalized) ?? 0, 1_000_000_000));
    }
  }

  const words = Array.from(frequencyByWord.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TARGET_SIZE)
    .map(([word]) => word);

  await mkdir(path.join("public"), { recursive: true });
  await writeFile("public/dictionary.json", `${JSON.stringify(words, null, 2)}\n`);

  console.log(`Wrote ${words.length} words to public/dictionary.json`);
}

await main();
