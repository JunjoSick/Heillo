import { Fragment } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { OperationLegend } from "@/components/OperationLegend";
import { PhonemeView } from "@/components/PhonemeView";
import { WordCard } from "@/components/WordCard";
import type { MoveValidation, PathEntry } from "@/lib/types";
import { getCompoundStreak } from "@/lib/path/pathRules";

interface PathTimelineProps {
  path: PathEntry[];
  maxCompoundStreak: number;
  onReset: () => void;
}

export function PathTimeline({
  path,
  maxCompoundStreak,
  onReset
}: PathTimelineProps) {
  const moves = path.map((entry) => entry.move).filter(Boolean) as MoveValidation[];
  const compoundStreak = getCompoundStreak(moves);

  return (
    <section className="rounded border border-moss/15 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Path</h2>
          <p className="mt-1 text-sm text-moss">
            Compound streak: {compoundStreak}/{maxCompoundStreak}
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded border border-moss/25 bg-white px-3 text-sm font-semibold text-ink"
          onClick={onReset}
          title="Reset path"
          type="button"
        >
          <RotateCcw aria-hidden size={17} />
          <span>Reset</span>
        </button>
      </div>

      <div className="mt-4">
        <OperationLegend />
      </div>

      {path.length === 0 ? (
        <p className="mt-4 text-sm text-moss">Start a word to begin a path.</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex min-w-full flex-col gap-3 md:flex-row md:items-stretch">
              {path.map((entry, index) => (
                <Fragment key={`${entry.word.raw}-${index}`}>
                  {index > 0 ? <PathConnector move={entry.move} /> : null}
                  <WordCard
                    entry={entry}
                    index={index}
                    isLatest={index === path.length - 1}
                  />
                </Fragment>
              ))}
            </div>
          </div>

          <details className="mt-4 border-t border-moss/10 pt-3">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Path details
            </summary>
            <ol className="mt-3 grid gap-3">
              {path.map((entry, index) => (
                <li
                  className="grid gap-2 rounded-lg border border-moss/10 bg-paper p-3"
                  key={`${entry.word.raw}-debug-${index}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-ink text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-lg font-semibold text-ink">
                      {entry.word.raw}
                    </span>
                    {entry.move ? (
                      <span className="rounded border border-moss/20 bg-white px-2 py-1 text-xs font-semibold text-moss">
                        {entry.move.class}, cost {entry.move.cost}
                      </span>
                    ) : null}
                  </div>
                  <PhonemeView phonemes={entry.word.phonemes} />
                  {entry.move && entry.move.changes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 text-xs text-moss">
                      {entry.move.changes.map((change, changeIndex) => (
                        <span
                          className="rounded bg-white px-2 py-1"
                          key={`${change.description}-${changeIndex}`}
                        >
                          {change.description}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </details>
        </>
      )}
    </section>
  );
}

function PathConnector({ move }: { move?: MoveValidation }) {
  return (
    <div className="flex items-center justify-center md:min-w-12">
      <div
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-moss/15 bg-mist text-moss shadow-sm"
        title={move?.changes.map((change) => change.description).join(", ") || "next word"}
      >
        <ArrowRight aria-hidden className="rotate-90 md:rotate-0" size={18} />
      </div>
    </div>
  );
}
