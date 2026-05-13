import { useMemo, type CSSProperties } from "react";
import { Tile } from "./Tile";
import { RulePill } from "./RulePill";
import { ruleTint, toIndicesAffected, type ChainOp, type ChainRule } from "./diff";

interface WordRowProps {
  word: string;
  op: ChainOp | null;
  isStart: boolean;
  index: number;
  latest?: boolean;
}

export function WordRow({ word, op, isStart, index, latest }: WordRowProps) {
  const letters = word.split("");
  const ruleType: ChainRule | null =
    op && op.type !== "noop" && op.type !== "invalid" ? (op.type as ChainRule) : null;

  const toHighlights = useMemo(() => {
    const set = new Set<number>();
    if (op) toIndicesAffected(op, letters.length).forEach((i) => set.add(i));
    return set;
  }, [op, letters.length]);

  return (
    <div className={"word-row" + (latest ? " row-latest" : "")}>
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
            style={{ background: "var(--ink)", color: "var(--paper)", border: "none" }}
          >
            start
          </span>
        ) : ruleType ? (
          <RulePill type={ruleType} />
        ) : null}
      </div>
    </div>
  );
}

function stepBadgeStyle(isStart: boolean, ruleType: ChainRule | null): CSSProperties {
  const tint = ruleType ? ruleTint(ruleType) : null;
  return {
    fontFamily: '"Geist Mono", monospace',
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
