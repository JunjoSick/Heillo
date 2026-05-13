import { useId as useReactId } from "react";
import type { CSSProperties } from "react";
import type { VisualRuleType } from "../visualOps";

// React's useId returns ids containing ":", valid as HTML ids but quirky inside
// url(#...) refs. Strip them so SVG markerEnd refs stay spec-clean.
export function useArrowId(): string {
  return `arr-${useReactId().replace(/:/g, "")}`;
}

export const plusBadge = (color: string): CSSProperties => ({
  position: "absolute",
  top: -8,
  right: -8,
  width: 18,
  height: 18,
  borderRadius: 999,
  background: color,
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1
});

export const RULE_TINTS: Record<VisualRuleType, { c: string; bg: string }> = {
  substitution: { c: "var(--sub)", bg: "var(--sub-bg)" },
  insertion: { c: "var(--ins)", bg: "var(--ins-bg)" },
  deletion: { c: "var(--del)", bg: "var(--del-bg)" },
  swap: { c: "var(--swp)", bg: "var(--swp-bg)" },
  lengthening: { c: "var(--len)", bg: "var(--len-bg)" },
  shortening: { c: "var(--shr)", bg: "var(--shr-bg)" },
  "cluster-change": { c: "var(--clu)", bg: "var(--clu-bg)" },
  "onset-change": { c: "var(--ons)", bg: "var(--ons-bg)" },
  homophone: { c: "var(--moss)", bg: "#EEEAD8" },
  noop: { c: "var(--moss-soft)", bg: "#FFFFFF" },
  invalid: { c: "var(--del)", bg: "var(--del-bg)" }
};

export function ruleTint(type: VisualRuleType) {
  return RULE_TINTS[type] ?? { c: "var(--ink)", bg: "#fff" };
}
