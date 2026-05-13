import { ChangeTiles } from "@/components/ChangeTiles";
import { PhonemeView } from "@/components/PhonemeView";
import { RuleBadge } from "@/components/RuleBadge";
import type { MoveClass, PathEntry } from "@/lib/types";

interface WordCardProps {
  entry: PathEntry;
  index: number;
  isLatest: boolean;
}

const classStyle: Record<MoveClass, string> = {
  smooth: "border-leaf/40 bg-emerald-50",
  valid: "border-sky-300 bg-sky-50",
  borderline: "border-orange-300 bg-orange-50",
  invalid: "border-red-300 bg-red-50"
};

const classBadgeStyle: Record<MoveClass, string> = {
  smooth: "bg-leaf text-white",
  valid: "bg-sky-600 text-white",
  borderline: "bg-orange-500 text-white",
  invalid: "bg-red-600 text-white"
};

export function WordCard({ entry, index, isLatest }: WordCardProps) {
  const move = entry.move;
  const cardStyle = move ? classStyle[move.class] : "border-moss/15 bg-white";

  return (
    <article
      className={`min-w-64 rounded-2xl border p-4 shadow-sm ${
        isLatest ? "ring-2 ring-gold/60" : ""
      } ${cardStyle}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-normal text-moss">
            Step {index + 1}
          </div>
          <h3 className="mt-1 text-2xl font-black text-ink">{entry.word.raw}</h3>
          {entry.word.normalized !== entry.word.raw ? (
            <div className="text-xs text-moss">normalized {entry.word.normalized}</div>
          ) : null}
        </div>

        {move ? (
          <div
            className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-normal ${classBadgeStyle[move.class]}`}
          >
            {move.class}
          </div>
        ) : (
          <div className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold uppercase tracking-normal text-white">
            start
          </div>
        )}
      </div>

      <div className="mt-3">
        <PhonemeView phonemes={entry.word.phonemes} />
      </div>

      {move ? (
        <div className="mt-4 grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink">
              cost {formatCost(move.cost)}
            </span>
            <span className="text-xs text-moss">{move.lexical.source}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {move.homophoneMove ? <RuleBadge type="homophone" /> : null}
            {move.changes.length === 0 && !move.homophoneMove ? (
              <RuleBadge type="match" />
            ) : null}
            {move.changes.map((change, changeIndex) => (
              <RuleBadge
                change={change}
                key={`${change.type}-${change.description}-${changeIndex}`}
              />
            ))}
          </div>

          {move.changes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {move.changes.map((change, changeIndex) => (
                <ChangeTiles
                  change={change}
                  compact
                  key={`${change.description}-${changeIndex}`}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
              {move.homophoneMove ? "same game sound" : "no phonetic change"}
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

function formatCost(cost: number): string {
  return Number.isFinite(cost) ? cost.toFixed(2) : "inf";
}
