import { RuleBadge } from "@/components/RuleBadge";
import type { ChangeType } from "@/lib/types";

const legendItems: Array<{
  type: ChangeType | "homophone" | "match";
  note: string;
}> = [
  { type: "substitution", note: "one sound changes" },
  { type: "insertion", note: "sound added" },
  { type: "deletion", note: "sound dropped" },
  { type: "lengthening", note: "double sound" },
  { type: "shortening", note: "shortened sound" },
  { type: "cluster-change", note: "cluster split or merge" },
  { type: "onset-change", note: "compact onset blooms" },
  { type: "swap", note: "neighbors trade spots" },
  { type: "homophone", note: "same game sound" },
  { type: "match", note: "stable tile" }
];

export function OperationLegend() {
  return (
    <div className="rounded-lg border border-moss/10 bg-white/70 p-3">
      <h3 className="text-sm font-semibold text-ink">Operation legend</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {legendItems.map((item) => (
          <div
            className="inline-flex items-center gap-2 rounded-full bg-paper px-2 py-1"
            key={item.type}
          >
            <RuleBadge type={item.type} />
            <span className="text-xs text-moss">{item.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
