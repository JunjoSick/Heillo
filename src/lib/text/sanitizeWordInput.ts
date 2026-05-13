const ALLOWED_WORD_CHARS = /[^a-zA-Zàèéìòù'\-]/g;

export function sanitizeWordInput(raw: string): string {
  return raw.replace(ALLOWED_WORD_CHARS, "");
}
