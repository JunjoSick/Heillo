import type { AlignmentStep } from "@/lib/types";

interface DebugAlignmentProps {
  alignment: AlignmentStep[] | null;
}

export function DebugAlignment({ alignment }: DebugAlignmentProps) {
  if (!alignment) {
    return (
      <div className="rounded border border-clay/25 bg-clay/10 p-3 text-sm text-clay">
        No alignment is available for this result.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-moss/15 bg-white p-3">
      <div className="grid min-w-max gap-2 text-sm">
        <div className="grid grid-cols-[4rem_1fr] gap-2">
          <span className="font-semibold text-moss">FROM</span>
          <div className="flex gap-1.5">
            {alignment.map((step, index) => (
              <span
                className="min-w-9 rounded bg-mist px-2 py-1 text-center font-semibold"
                key={`from-${index}`}
              >
                {step.from.join(" ") || "·"}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[4rem_1fr] gap-2">
          <span className="font-semibold text-moss">TO</span>
          <div className="flex gap-1.5">
            {alignment.map((step, index) => (
              <span
                className="min-w-9 rounded bg-paper px-2 py-1 text-center font-semibold"
                key={`to-${index}`}
              >
                {step.to.join(" ") || "·"}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
