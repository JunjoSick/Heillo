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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr 130px",
        alignItems: "center",
        columnGap: 12,
        padding: "8px 0",
        minHeight: 96
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={railStyle} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {children}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          <span
            style={{
              fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
              fontSize: 11,
              color: "var(--moss)",
              paddingLeft: 4
            }}
          >
            {accentDetail}
          </span>
        ) : null}
        {isPreview ? (
          <span
            style={{
              fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
              fontSize: 9,
              color: "var(--moss-soft)",
              paddingLeft: 4,
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}
          >
            preview
          </span>
        ) : null}
      </div>
    </div>
  );
}
