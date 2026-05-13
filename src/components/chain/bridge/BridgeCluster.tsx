import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";
import { useArrowId } from "./bridgeUtils";

export function BridgeCluster({
  change,
  source
}: {
  change: VisualChange;
  source: BridgeSource;
}) {
  const arrowId = useArrowId();
  return (
    <BridgeShell
      tint="var(--clu)"
      accentLabel="cluster"
      accentDetail={change.description}
      source={source}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Brace side="left" color="var(--clu)" />
        <div style={{ display: "flex", gap: 3 }}>
          {change.from.map((ch, i) => (
            <span
              key={i}
              className="tile tiny"
              style={{
                borderColor: "var(--clu)",
                color: "var(--clu)",
                background: "#fff",
                fontWeight: 500
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <Brace side="right" color="var(--clu)" />
        <svg width="40" height="32" viewBox="0 0 40 32">
          <defs>
            <marker
              id={arrowId}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--clu)" />
            </marker>
          </defs>
          <path
            d="M2 10 Q 20 -2, 38 10"
            fill="none"
            stroke="var(--clu)"
            strokeWidth="1.5"
            markerEnd={`url(#${arrowId})`}
          />
          <path
            d="M2 22 Q 20 34, 38 22"
            fill="none"
            stroke="var(--clu)"
            strokeWidth="1.5"
            markerEnd={`url(#${arrowId})`}
            strokeDasharray="3 3"
          />
        </svg>
        <Brace side="left" color="var(--clu)" />
        <div style={{ display: "flex", gap: 3 }}>
          {change.to.map((ch, i) => (
            <span
              key={i}
              className="tile tiny"
              style={{
                borderColor: "var(--clu)",
                color: "var(--clu)",
                background: "var(--clu-bg)",
                fontWeight: 500
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <Brace side="right" color="var(--clu)" />
      </div>
    </BridgeShell>
  );
}

function Brace({ side, color }: { side: "left" | "right"; color: string }) {
  const path =
    side === "left"
      ? "M14 2 Q 6 2, 6 12 L 6 18 Q 6 24, 2 24 Q 6 24, 6 30 L 6 36 Q 6 46, 14 46"
      : "M2 2 Q 10 2, 10 12 L 10 18 Q 10 24, 14 24 Q 10 24, 10 30 L 10 36 Q 10 46, 2 46";
  return (
    <svg width="16" height="48" viewBox="0 0 16 48">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
