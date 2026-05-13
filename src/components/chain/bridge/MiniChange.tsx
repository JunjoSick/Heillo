import type { VisualChange } from "../visualOps";
import { ruleTint } from "./bridgeUtils";

const ARROW_BY_TYPE: Record<string, string> = {
  substitution: "→",
  insertion: "+",
  deletion: "−",
  swap: "⇄",
  lengthening: "×2",
  shortening: "÷2",
  "cluster-change": "↝",
  "onset-change": "↝",
  homophone: "=",
  invalid: "·",
  noop: "·"
};

export function MiniChange({ change }: { change: VisualChange }) {
  const tint = ruleTint(change.type);
  const arrow = ARROW_BY_TYPE[change.type] ?? "→";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 8,
        border: `1px solid ${tint.c}`,
        background: tint.bg,
        color: tint.c,
        fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
        fontSize: 11,
        lineHeight: 1.2
      }}
      title={change.description}
    >
      <TokenStack tokens={change.from} />
      <span style={{ opacity: 0.7 }}>{arrow}</span>
      <TokenStack tokens={change.to} />
    </span>
  );
}

function TokenStack({ tokens }: { tokens: string[] }) {
  if (tokens.length === 0) {
    return <span style={{ opacity: 0.5 }}>∅</span>;
  }
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {tokens.map((token, i) => (
        <span key={i} style={{ fontWeight: 500 }}>
          {token}
        </span>
      ))}
    </span>
  );
}
