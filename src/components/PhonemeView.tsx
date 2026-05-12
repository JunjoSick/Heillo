import type { PhonemeToken } from "@/lib/types";

interface PhonemeViewProps {
  phonemes: PhonemeToken[];
  emptyLabel?: string;
}

export function PhonemeView({
  phonemes,
  emptyLabel = "No phonemes"
}: PhonemeViewProps) {
  if (phonemes.length === 0) {
    return <span className="text-sm text-moss/70">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {phonemes.map((phoneme, index) => (
        <span
          className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-moss/20 bg-white px-2 text-sm font-semibold text-ink"
          key={`${phoneme}-${index}`}
        >
          {phoneme}
        </span>
      ))}
    </div>
  );
}
