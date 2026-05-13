import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";
import { useArrowId } from "./bridgeUtils";

export function BridgeShortening({
  change,
  source
}: {
  change: VisualChange;
  source: BridgeSource;
}) {
  const arrowId = useArrowId();
  const baseLetter = change.to[0] ?? change.from[0] ?? "·";
  return (
    <BridgeShell
      tint="var(--shr)"
      accentLabel="shortening"
      accentDetail={change.description}
      source={source}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span
            className="tile tiny"
            style={{
              borderColor: "var(--shr)",
              background: "#fff",
              color: "var(--shr)",
              fontWeight: 500,
              animation: "drift 2.6s ease-in-out infinite"
            }}
          >
            {baseLetter}
          </span>
          <span
            className="tile tiny"
            style={{
              borderColor: "var(--shr)",
              background: "#fff",
              color: "var(--shr)",
              fontWeight: 500,
              animation: "drift 2.6s ease-in-out .3s infinite"
            }}
          >
            {baseLetter}
          </span>
        </div>
        <svg width="46" height="44" viewBox="0 0 46 44">
          <defs>
            <marker
              id={arrowId}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--shr)" />
            </marker>
          </defs>
          <path
            d="M4 6 L 16 14 Q 22 22, 26 22 L 42 22"
            fill="none"
            stroke="var(--shr)"
            strokeWidth="1.6"
            markerEnd={`url(#${arrowId})`}
          />
          <path
            d="M4 38 L 16 30 Q 22 22, 26 22 L 42 22"
            fill="none"
            stroke="var(--shr)"
            strokeWidth="1.6"
          />
        </svg>
        <span
          className="tile small"
          style={{
            borderColor: "var(--shr)",
            background: "var(--shr-bg)",
            color: "var(--shr)",
            fontWeight: 500
          }}
        >
          {baseLetter}
        </span>
        <div
          style={{
            marginLeft: 4,
            width: 14,
            height: 14,
            borderRadius: 99,
            background: "var(--shr)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace'
          }}
        >
          ÷2
        </div>
      </div>
    </BridgeShell>
  );
}
