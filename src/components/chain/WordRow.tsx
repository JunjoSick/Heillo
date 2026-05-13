import { useMemo, type CSSProperties } from "react";
import { Tile } from "./Tile";
import { RulePill } from "./RulePill";
import { ruleTint, toIndicesAffected, type ChainOp, type ChainRule } from "./diff";
import { ruleTint as visualRuleTint } from "./bridge/bridgeUtils";
import type { VisualChange, VisualRuleType } from "./visualOps";
import type { PhonemeToken } from "@/lib/types";

// Raw letter highlights are cosmetic. Phoneme chips and MoveValidation.changes
// are authoritative — refer to them when in doubt.

interface WordRowProps {
  word: string;
  op: ChainOp | null;
  isStart: boolean;
  index: number;
  latest?: boolean;
  phonemes?: PhonemeToken[];
  visualChanges?: VisualChange[];
}

export function WordRow({
  word,
  op,
  isStart,
  index,
  latest,
  phonemes,
  visualChanges
}: WordRowProps) {
  const letters = word.split("");
  const ruleType: ChainRule | null =
    op && op.type !== "noop" && op.type !== "invalid" ? (op.type as ChainRule) : null;

  const toHighlights = useMemo(() => {
    const set = new Set<number>();
    if (op) toIndicesAffected(op, letters.length).forEach((i) => set.add(i));
    return set;
  }, [op, letters.length]);

  // Phoneme tint resolution: a chip is tinted when its token appears in any
  // visualChange.from / visualChange.to. We track _which_ rule type tinted
  // each chip so a compound move colors each touched phoneme with its own rule.
  const phonemeTints = useMemo(() => {
    if (!phonemes || !visualChanges || visualChanges.length === 0) {
      return new Map<number, VisualRuleType>();
    }
    // Build a multiset of tokens-to-rule, scanning right-to-left so we match
    // the first occurrence in the word once and don't paint everything.
    const map = new Map<number, VisualRuleType>();
    const usedFrom = new Set<number>();
    const usedTo = new Set<number>();
    for (const change of visualChanges) {
      if (change.type === "homophone") {
        // Homophone: tint all phonemes since they're collectively "same sound".
        for (let i = 0; i < phonemes.length; i++) {
          if (!map.has(i)) map.set(i, "homophone");
        }
        continue;
      }
      for (const token of change.to) {
        const idx = phonemes.findIndex(
          (p, i) => !usedTo.has(i) && String(p) === token
        );
        if (idx >= 0) {
          usedTo.add(idx);
          if (!map.has(idx)) map.set(idx, change.type);
        }
      }
      for (const token of change.from) {
        const idx = phonemes.findIndex(
          (p, i) => !usedFrom.has(i) && String(p) === token
        );
        if (idx >= 0) {
          usedFrom.add(idx);
          if (!map.has(idx)) map.set(idx, change.type);
        }
      }
    }
    return map;
  }, [phonemes, visualChanges]);

  return (
    <div className={"word-row-shell" + (latest ? " row-latest" : "")}>
      <div className="word-row">
        <div style={stepBadgeStyle(isStart, ruleType)}>
          {isStart ? "01" : String(index + 1).padStart(2, "0")}
        </div>

        <div style={{ display: "flex", gap: "var(--tile-gap)" }}>
          {letters.map((ch, i) => (
            <Tile
              key={i}
              letter={ch}
              highlight={toHighlights.has(i)}
              ruleType={ruleType}
            />
          ))}
        </div>

        <div style={metaStyle}>
          {isStart ? (
            <span
              className="pill"
              style={{
                background: "var(--ink)",
                color: "var(--paper)",
                border: "none"
              }}
            >
              start
            </span>
          ) : ruleType ? (
            <RulePill type={ruleType} />
          ) : null}
        </div>
      </div>

      {phonemes && phonemes.length > 0 ? (
        <div className="phoneme-row">
          {phonemes.map((p, i) => {
            const tintType = phonemeTints.get(i);
            const tint = tintType ? visualRuleTint(tintType) : null;
            return (
              <span
                key={i}
                className="phoneme-chip"
                style={
                  tint
                    ? {
                        color: tint.c,
                        background: tint.bg,
                        borderColor: tint.c
                      }
                    : undefined
                }
              >
                {p}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function stepBadgeStyle(isStart: boolean, ruleType: ChainRule | null): CSSProperties {
  const tint = ruleType ? ruleTint(ruleType) : null;
  return {
    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
    fontSize: 11,
    letterSpacing: "0.08em",
    color: isStart ? "var(--paper)" : tint?.c || "var(--moss)",
    background: isStart ? "var(--ink)" : "transparent",
    border: isStart ? "none" : `1px solid ${tint?.c || "rgba(20,18,12,0.15)"}`,
    width: 36,
    height: 36,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    fontWeight: 600
  };
}

const metaStyle: CSSProperties = {
  marginLeft: 14,
  minWidth: 110,
  display: "inline-flex",
  alignItems: "center"
};
