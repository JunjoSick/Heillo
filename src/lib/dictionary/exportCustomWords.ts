export function exportCustomWords(customWords: string[]): string {
  return JSON.stringify(
    {
      customWords: [...customWords].sort((a, b) => a.localeCompare(b)),
      exportedAt: new Date().toISOString()
    },
    null,
    2
  );
}
