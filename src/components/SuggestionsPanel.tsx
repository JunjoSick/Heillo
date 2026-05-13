import { Search } from "lucide-react";
import { ChangeTiles } from "@/components/ChangeTiles";
import { RuleBadge } from "@/components/RuleBadge";
import type { MoveClass, Suggestion } from "@/lib/types";

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  onGenerate: () => void;
  onUseSuggestion: (word: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const groups: MoveClass[] = ["smooth", "valid", "borderline"];

const groupStyle: Record<MoveClass, string> = {
  smooth: "border-leaf/30 bg-emerald-50",
  valid: "border-sky-200 bg-sky-50",
  borderline: "border-orange-200 bg-orange-50",
  invalid: "border-red-200 bg-red-50"
};

export function SuggestionsPanel({
  suggestions,
  onGenerate,
  onUseSuggestion,
  disabled = false,
  loading = false
}: SuggestionsPanelProps) {
  return (
    <section className="rounded border border-moss/15 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Suggestions</h2>
          <p className="mt-1 text-sm text-moss">
            Ranked by class, cost, change count, and word length.
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded bg-moss px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || loading}
          onClick={onGenerate}
          title="Generate suggestions"
          type="button"
        >
          <Search aria-hidden size={17} />
          <span>{loading ? "Generating" : "Generate"}</span>
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {groups.map((group) => {
          const groupSuggestions = suggestions.filter(
            (suggestion) => suggestion.validation.class === group
          );

          return (
            <div key={group}>
              <h3 className="text-sm font-semibold capitalize text-ink">{group}</h3>
              {groupSuggestions.length === 0 ? (
                <p className="mt-1 text-sm text-moss/75">No {group} suggestions.</p>
              ) : (
                <ul className="mt-2 grid gap-2">
                  {groupSuggestions.map((suggestion) => (
                    <li
                      className={`grid gap-2 rounded-lg border px-3 py-2 text-sm ${groupStyle[group]}`}
                      key={suggestion.word}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-lg font-bold text-ink">
                            {suggestion.word}
                          </span>
                          <span className="ml-2 text-moss">
                            {suggestion.validation.class} / cost{" "}
                            {formatCost(suggestion.validation.cost)}
                          </span>
                        </div>
                        <button
                          className="h-8 rounded border border-moss/25 bg-white px-2 text-xs font-semibold text-ink"
                          onClick={() => onUseSuggestion(suggestion.word)}
                          type="button"
                        >
                          Check
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {suggestion.validation.homophoneMove ? (
                          <RuleBadge type="homophone" />
                        ) : null}
                        {suggestion.validation.changes.length === 0 &&
                        !suggestion.validation.homophoneMove ? (
                          <RuleBadge type="match" />
                        ) : null}
                        {suggestion.validation.changes.map((change, index) => (
                          <RuleBadge
                            change={change}
                            key={`${change.description}-${index}`}
                          />
                        ))}
                      </div>

                      {suggestion.validation.changes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {suggestion.validation.changes.map((change, index) => (
                            <ChangeTiles
                              change={change}
                              compact
                              key={`${change.description}-${index}`}
                            />
                          ))}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatCost(cost: number): string {
  return Number.isFinite(cost) ? cost.toFixed(2) : "inf";
}
