import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";
import { useArrowId } from "./bridgeUtils";

export function BridgeSubstitution({
  change,
  source
}: {
  change: VisualChange;
  source: BridgeSource;
}) {
  const arrowId = useArrowId();
  const from = change.from[0] ?? "·";
  const to = change.to[0] ?? "·";
  return (
    <BridgeShell
      tint="var(--sub)"
      accentLabel="substitution"
      accentDetail={change.description}
      source={source}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <FlipPair from={from} to={to} />
        <svg width="44" height="22" viewBox="0 0 44 22">
          <defs>
            <marker
              id={arrowId}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--sub)" />
            </marker>
          </defs>
          <path
            d="M2 11 L38 11"
            stroke="var(--sub)"
            strokeWidth="1.6"
            strokeDasharray="3 3"
            fill="none"
            markerEnd={`url(#${arrowId})`}
          />
        </svg>
        <span
          className="tile small"
          style={{
            borderColor: "var(--sub)",
            background: "var(--sub-bg)",
            color: "var(--sub)",
            fontWeight: 500
          }}
        >
          {to}
        </span>
      </div>
    </BridgeShell>
  );
}

function FlipPair({ from, to }: { from: string; to: string }) {
  return (
    <div style={{ position: "relative", width: 42, height: 42, perspective: 200 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          animation: "flip 3.8s cubic-bezier(.6,0,.4,1) infinite"
        }}
      >
        <span
          className="tile small"
          style={{
            position: "absolute",
            inset: 0,
            borderColor: "var(--sub)",
            color: "var(--sub)",
            background: "#fff",
            backfaceVisibility: "hidden"
          }}
        >
          {from}
        </span>
        <span
          className="tile small"
          style={{
            position: "absolute",
            inset: 0,
            borderColor: "var(--sub)",
            color: "var(--sub)",
            background: "var(--sub-bg)",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          {to}
        </span>
      </div>
    </div>
  );
}
