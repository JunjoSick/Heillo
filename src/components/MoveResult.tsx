import { Check, Plus, X } from "lucide-react";
import { DebugAlignment } from "@/components/DebugAlignment";
import { PhonemeView } from "@/components/PhonemeView";
import type { MoveValidation, PathAcceptance } from "@/lib/types";

interface MoveResultProps {
  validation: MoveValidation | null;
  acceptance: PathAcceptance | null;
  onAccept: () => void;
  onAcceptWord: () => void;
}

const classStyle = {
  smooth: "bg-leaf/15 text-leaf border-leaf/25",
  valid: "bg-gold/20 text-ink border-gold/30",
  borderline: "bg-clay/15 text-clay border-clay/25",
  invalid: "bg-clay text-white border-clay"
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Candidate Result</h2>
          <p className="mt-1 text-sm text-moss">{validation.explanation}</p>
        </div>
        <span
          className={`rounded border px-3 py-1 text-sm font-semibold ${classStyle[validation.class]}`}
        >
          {validation.class}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <div className="text-sm font-semibold text-moss">
            {validation.to.raw} phonemes
          </div>
          <PhonemeView phonemes={validation.to.phonemes} />
        </div>
        <div className="grid gap-1 text-sm">
          <div>
            <span className="font-semibold">Cost:</span> {validation.cost}
          </div>
          <div>
            <span className="font-semibold">Compound:</span>{" "}
            {validation.isCompound ? "yes" : "no"}
          </div>
          <div>
            <span className="font-semibold">Dictionary status:</span>{" "}
            {validation.lexical.source}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-ink">Changes</h3>
        {validation.changes.length === 0 ? (
          <p className="mt-1 text-sm text-moss">No phonetic change.</p>
        ) : (
          <ul className="mt-2 grid gap-1.5 text-sm">
            {validation.changes.map((change, index) => (
              <li
                className="rounded border border-moss/10 bg-paper px-3 py-2"
                key={`${change.description}-${index}`}
              >
                {change.description}, cost {change.cost}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-ink">Debug Alignment</h3>
        <DebugAlignment alignment={validation.alignment} />
      </div>

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
