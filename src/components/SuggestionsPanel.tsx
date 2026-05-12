import { Search } from "lucide-react";
import type { MoveClass, Suggestion } from "@/lib/types";

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  onGenerate: () => void;
  onUseSuggestion: (word: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const groups: MoveClass[] = ["smooth", "valid", "borderline"];

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
                      className="flex flex-wrap items-center justify-between gap-2 rounded border border-moss/10 bg-paper px-3 py-2 text-sm"
                      key={suggestion.word}
                    >
                      <div>
                        <span className="font-semibold text-ink">{suggestion.word}</span>
                        <span className="ml-2 text-moss">
                          cost {suggestion.validation.cost}
                        </span>
                        <span className="ml-2 text-moss">
                          {suggestion.validation.changes
                            .map((change) => change.description)
                            .join(", ")}
                        </span>
                      </div>
                      <button
                        className="h-8 rounded border border-moss/25 bg-white px-2 text-xs font-semibold text-ink"
                        onClick={() => onUseSuggestion(suggestion.word)}
                        type="button"
                      >
                        Check
                      </button>
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
