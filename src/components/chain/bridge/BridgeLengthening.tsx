import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";
import { useArrowId } from "./bridgeUtils";

export function BridgeLengthening({
  change,
  source
}: {
  change: VisualChange;
  source: BridgeSource;
}) {
  const arrowId = useArrowId();
  const baseLetter = change.from[0] ?? change.to[0] ?? "·";
  return (
    <BridgeShell
      tint="var(--len)"
      accentLabel="lengthening"
      accentDetail={change.description}
      source={source}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          className="tile small"
          style={{
            borderColor: "var(--len)",
            background: "#fff",
            color: "var(--len)"
          }}
        >
          {baseLetter}
        </span>
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
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--len)" />
            </marker>
          </defs>
          <path
            d="M4 22 L20 22 Q 26 22, 28 14 L 40 6"
            fill="none"
            stroke="var(--len)"
            strokeWidth="1.6"
            markerEnd={`url(#${arrowId})`}
          />
          <path
            d="M4 22 L20 22 Q 26 22, 28 30 L 40 38"
            fill="none"
            stroke="var(--len)"
            strokeWidth="1.6"
            markerEnd={`url(#${arrowId})`}
          />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span
            className="tile tiny"
            style={{
              borderColor: "var(--len)",
              background: "var(--len-bg)",
              color: "var(--len)",
              fontWeight: 500
            }}
          >
            {baseLetter}
          </span>
          <span
            className="tile tiny"
            style={{
              borderColor: "var(--len)",
              background: "var(--len-bg)",
              color: "var(--len)",
              fontWeight: 500
            }}
          >
            {baseLetter}
          </span>
        </div>
        <div
          style={{
            marginLeft: 6,
            width: 14,
            height: 14,
            borderRadius: 99,
            background: "var(--len)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace'
          }}
        >
          ×2
        </div>
      </div>
    </BridgeShell>
  );
}
