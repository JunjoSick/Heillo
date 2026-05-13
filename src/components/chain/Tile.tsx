import type { CSSProperties } from "react";
import { ruleTint, type ChainRule } from "./diff";

type Size = "default" | "small" | "tiny";

interface TileProps {
  letter: string;
  highlight?: boolean;
  ruleType?: ChainRule | null;
  size?: Size;
  style?: CSSProperties;
  dim?: boolean;
}

export function Tile({
  letter,
  highlight = false,
  ruleType,
  size = "default",
  style,
  dim = false
}: TileProps) {
  const tint = highlight && ruleType ? ruleTint(ruleType) : null;
  const sizeClass = size === "small" ? " small" : size === "tiny" ? " tiny" : "";
  const base: CSSProperties = {
    background: tint ? tint.bg : undefined,
    borderColor: tint ? tint.c : undefined,
    color: tint ? tint.c : undefined,
    fontWeight: tint ? 500 : 400,
    opacity: dim ? 0.35 : 1,
    transition:
      "background 360ms ease, border-color 360ms ease, color 360ms ease, opacity 360ms ease",
    ...style
  };
  return (
    <span
      className={"tile" + sizeClass}
      style={base}
      data-rule={ruleType || ""}
    >
      {letter}
    </span>
  );
}
