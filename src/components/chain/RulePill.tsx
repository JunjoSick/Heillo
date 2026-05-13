import { RULE_LABELS, ruleTint, type ChainRule } from "./diff";

export function RulePill({ type }: { type: ChainRule }) {
  const tint = ruleTint(type);
  return (
    <span
      className="pill"
      style={{ background: tint.bg, borderColor: tint.c, color: tint.c }}
    >
      <span className="swatch" style={{ background: tint.c }} />
      {RULE_LABELS[type]}
    </span>
  );
}
