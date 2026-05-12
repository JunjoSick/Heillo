const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export async function loadDictionary(): Promise<string[]> {
  const response = await fetch(`${basePath}/dictionary.json`);

  if (!response.ok) {
    throw new Error(`Failed to load dictionary: ${response.status}`);
  }

  const words = (await response.json()) as unknown;

  if (!Array.isArray(words)) {
    throw new Error("Dictionary JSON must be an array of words.");
  }

  return words.filter((word): word is string => typeof word === "string");
}
