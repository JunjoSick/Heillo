import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";
import { useArrowId } from "./bridgeUtils";

export function BridgeSwap({
  change,
  source
}: {
  change: VisualChange;
  source: BridgeSource;
}) {
  const arrowId = useArrowId();
  const a = change.from[0] ?? "·";
  const b = change.from[1] ?? "·";
  const toA = change.to[0] ?? "·";
  const toB = change.to[1] ?? "·";
  return (
    <BridgeShell
      tint="var(--swp)"
      accentLabel="swap"
      accentDetail={change.description || `${a} ⇄ ${b}`}
      source={source}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            style={{ position: "absolute", inset: 0 }}
          >
            <circle
              cx="32"
              cy="32"
              r="20"
              fill="none"
              stroke="var(--swp)"
              strokeWidth="1.2"
              strokeDasharray="3 4"
              opacity="0.5"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: 0,
              height: 0
            }}
          >
            <span
              className="tile tiny"
              style={{
                position: "absolute",
                transform: "translate(-50%,-50%)",
                borderColor: "var(--swp)",
                background: "#fff",
                color: "var(--swp)",
                fontWeight: 500,
                animation: "orbit-a 4s linear infinite"
              }}
            >
              {a}
            </span>
            <span
              className="tile tiny"
              style={{
                position: "absolute",
                transform: "translate(-50%,-50%)",
                borderColor: "var(--swp)",
                background: "var(--swp-bg)",
                color: "var(--swp)",
                fontWeight: 500,
                animation: "orbit-b 4s linear infinite"
              }}
            >
              {b}
            </span>
          </div>
        </div>
        <svg width="60" height="36" viewBox="0 0 60 36">
          <defs>
            <marker
              id={arrowId}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--swp)" />
            </marker>
          </defs>
          <path
            d="M4 12 Q 30 -8, 56 12"
            fill="none"
            stroke="var(--swp)"
            strokeWidth="1.6"
            markerEnd={`url(#${arrowId})`}
          />
          <path
            d="M56 24 Q 30 44, 4 24"
            fill="none"
            stroke="var(--swp)"
            strokeWidth="1.6"
            markerEnd={`url(#${arrowId})`}
          />
        </svg>
        <div style={{ display: "flex", gap: 4 }}>
          <span
            className="tile tiny"
            style={{
              borderColor: "var(--swp)",
              background: "var(--swp-bg)",
              color: "var(--swp)",
              fontWeight: 500
            }}
          >
            {toA}
          </span>
          <span
            className="tile tiny"
            style={{
              borderColor: "var(--swp)",
              background: "var(--swp-bg)",
              color: "var(--swp)",
              fontWeight: 500
            }}
          >
            {toB}
          </span>
        </div>
      </div>
    </BridgeShell>
  );
}
