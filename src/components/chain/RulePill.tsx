import { ruleTint } from "./bridge/bridgeUtils";
import type { VisualRuleType } from "./visualOps";

const RULE_LABELS: Record<VisualRuleType, string> = {
  substitution: "sub",
  insertion: "add",
  deletion: "drop",
  swap: "swap",
  lengthening: "lengthen",
  shortening: "shorten",
  "cluster-change": "cluster",
  "onset-change": "onset",
  homophone: "same",
  invalid: "invalid",
  noop: "same"
};

export function RulePill({ type }: { type: VisualRuleType }) {
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
