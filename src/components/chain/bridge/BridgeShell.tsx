import type { CSSProperties, ReactNode } from "react";

export type BridgeSource =
  | "validated-phonetic"
  | "tentative-spelling-preview"
  | "start";

interface BridgeShellProps {
  tint: string;
  accentLabel: string;
  accentDetail?: string;
  source: BridgeSource;
  children: ReactNode;
}

export function BridgeShell({
  tint,
  accentLabel,
  accentDetail,
  source,
  children
}: BridgeShellProps) {
  const isPreview = source === "tentative-spelling-preview";
  const railStyle: CSSProperties = isPreview
    ? {
        width: 2,
        height: 84,
        backgroundImage: `repeating-linear-gradient(to bottom, ${tint} 0 6px, transparent 6px 11px)`,
        borderRadius: 2,
        opacity: 0.8
      }
    : {
        width: 2,
        height: 84,
        background: `linear-gradient(${tint}55, ${tint} 50%, ${tint}55)`,
        borderRadius: 2
      };

  return (
    <div className="bridge-shell">
      <div className="bridge-rail">
        <div style={railStyle} />
      </div>
      <div className="bridge-body">{children}</div>
      <div className="bridge-label">
        <span
          className="pill"
          style={{
            background: "transparent",
            borderColor: tint,
            color: tint,
            borderStyle: isPreview ? "dashed" : "solid"
          }}
        >
          <span className="swatch" style={{ background: tint }} />
          {accentLabel}
        </span>
        {accentDetail ? (
          <span className="bridge-detail">{accentDetail}</span>
        ) : null}
        {isPreview ? <span className="bridge-preview-tag">preview</span> : null}
      </div>
    </div>
  );
}
