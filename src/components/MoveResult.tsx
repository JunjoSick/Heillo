import { Check, Plus, X } from "lucide-react";
import { ChangeTiles } from "@/components/ChangeTiles";
import { DebugAlignment } from "@/components/DebugAlignment";
import { PhonemeView } from "@/components/PhonemeView";
import { RuleBadge } from "@/components/RuleBadge";
import type { MoveClass, MoveValidation, PathAcceptance } from "@/lib/types";

interface MoveResultProps {
  validation: MoveValidation | null;
  acceptance: PathAcceptance | null;
  onAccept: () => void;
  onAcceptWord: () => void;
}

const classStyle: Record<MoveClass, string> = {
  smooth: "bg-leaf text-white border-leaf",
  valid: "bg-sky-600 text-white border-sky-600",
  borderline: "bg-orange-500 text-white border-orange-500",
  invalid: "bg-red-600 text-white border-red-600"
};

export function MoveResult({
  validation,
  acceptance,
  onAccept,
  onAcceptWord
}: MoveResultProps) {
  if (!validation) {
    return (
      <section className="rounded border border-moss/15 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Candidate Result</h2>
        <p className="mt-2 text-sm text-moss">
          Verify a candidate to inspect its phonetic class, cost, and alignment.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded border border-moss/15 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Candidate Result</h2>
          <p className="mt-1 text-sm text-moss">
            {validation.from.raw} to {validation.to.raw}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-sm font-bold uppercase tracking-normal ${classStyle[validation.class]}`}
        >
          {validation.class} / cost {formatCost(validation.cost)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-moss/10 bg-paper p-3">
          <div className="text-sm font-semibold text-moss">
            {validation.from.raw}
          </div>
          <div className="mt-2">
            <PhonemeView phonemes={validation.from.phonemes} />
          </div>
        </div>
        <div className="rounded-lg border border-moss/10 bg-paper p-3">
          <div className="text-sm font-semibold text-moss">{validation.to.raw}</div>
          <div className="mt-2">
            <PhonemeView phonemes={validation.to.phonemes} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {validation.homophoneMove ? <RuleBadge type="homophone" /> : null}
        {validation.changes.length === 0 && !validation.homophoneMove ? (
          <RuleBadge type="match" />
        ) : null}
        {validation.changes.map((change, index) => (
          <RuleBadge change={change} key={`${change.description}-${index}`} />
        ))}
      </div>

      <div className="mt-4">
        {validation.changes.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
            {validation.homophoneMove
              ? "Different spelling, same game phonetics."
              : "No phonetic change."}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {validation.changes.map((change, index) => (
              <ChangeTiles change={change} key={`${change.description}-${index}`} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-moss">
        <span className="rounded-full bg-mist px-2.5 py-1">
          {validation.isCompound ? "compound" : "atomic"}
        </span>
        <span className="rounded-full bg-mist px-2.5 py-1">
          {validation.meaningfulChangeCount} meaningful
        </span>
        <span className="rounded-full bg-mist px-2.5 py-1">
          {validation.lexical.source}
        </span>
      </div>

      <details className="mt-4 border-t border-moss/10 pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          Debug alignment
        </summary>
        <div className="mt-3">
          <DebugAlignment alignment={validation.alignment} />
        </div>
      </details>

      <div className="mt-4 flex flex-wrap gap-2">
        {acceptance?.accepted ? (
          <button
            className="inline-flex h-10 items-center gap-2 rounded bg-leaf px-3 text-sm font-semibold text-white"
            onClick={onAccept}
            title="Accept move"
            type="button"
          >
            <Check aria-hidden size={17} />
            <span>Accept move</span>
          </button>
        ) : (
          <span className="inline-flex min-h-10 items-center gap-2 rounded border border-clay/25 bg-clay/10 px-3 text-sm text-clay">
            <X aria-hidden size={17} />
            {acceptance?.message ?? "This move cannot be accepted."}
          </span>
        )}
        {validation.lexical.source === "missing" ? (
          <button
            className="inline-flex h-10 items-center gap-2 rounded border border-moss/25 bg-white px-3 text-sm font-semibold text-ink"
            onClick={onAcceptWord}
            title="Accept as word"
            type="button"
          >
            <Plus aria-hidden size={17} />
            <span>Accept as word</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}

function formatCost(cost: number): string {
  return Number.isFinite(cost) ? cost.toFixed(2) : "inf";
}
