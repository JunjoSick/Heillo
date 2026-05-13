import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";

export function BridgeHomophone({
  change,
  source
}: {
  change: VisualChange;
  source: BridgeSource;
}) {
  return (
    <BridgeShell
      tint="var(--moss)"
      accentLabel="same sound"
      accentDetail={change.description}
      source={source}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", gap: 3 }}>
          {change.from.map((ch, i) => (
            <span
              key={`a-${i}`}
              className="tile tiny"
              style={{
                borderColor: "var(--moss)",
                color: "var(--moss)",
                background: "#fff",
                fontWeight: 500
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <div
          style={{
            position: "relative",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
              fontSize: 38,
              color: "var(--moss)",
              animation: "drift 3.4s ease-in-out infinite"
            }}
          >
            =
          </span>
          <svg
            width="60"
            height="60"
            viewBox="-30 -30 60 60"
            style={{
              position: "absolute",
              inset: 0,
              animation: "spin-slow 14s linear infinite"
            }}
          >
            <circle
              cx="0"
              cy="0"
              r="22"
              fill="none"
              stroke="var(--moss)"
              strokeWidth="1"
              strokeDasharray="2 5"
              opacity="0.4"
            />
          </svg>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {change.to.map((ch, i) => (
            <span
              key={`b-${i}`}
              className="tile tiny"
              style={{
                borderColor: "var(--moss)",
                color: "var(--moss)",
                background: "#EEEAD8",
                fontWeight: 500
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>
    </BridgeShell>
  );
}
