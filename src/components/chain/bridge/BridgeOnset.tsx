import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";

export function BridgeOnset({
  change,
  source
}: {
  change: VisualChange;
  source: BridgeSource;
}) {
  return (
    <BridgeShell
      tint="var(--ons)"
      accentLabel="onset"
      accentDetail={change.description}
      source={source}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", gap: 3 }}>
          {change.from.map((ch, i) => (
            <span
              key={i}
              className="tile tiny"
              style={{
                borderColor: "var(--ons)",
                color: "var(--ons)",
                background: "#fff",
                fontWeight: 500
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <div style={{ position: "relative", width: 60, height: 60 }}>
          <svg
            width="60"
            height="60"
            viewBox="-30 -30 60 60"
            style={{ position: "absolute", inset: 0 }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <line
                key={i}
                x1={Math.cos((deg * Math.PI) / 180) * 8}
                y1={Math.sin((deg * Math.PI) / 180) * 8}
                x2={Math.cos((deg * Math.PI) / 180) * 22}
                y2={Math.sin((deg * Math.PI) / 180) * 22}
                stroke="var(--ons)"
                strokeWidth="1.6"
                strokeLinecap="round"
                style={{ opacity: i % 2 ? 0.55 : 1 }}
              />
            ))}
            <circle
              cx="0"
              cy="0"
              r="6"
              fill="var(--ons-bg)"
              stroke="var(--ons)"
              strokeWidth="1.6"
              style={{
                transformOrigin: "0 0",
                animation: "pulse-soft 2.4s ease-in-out infinite"
              }}
            />
          </svg>
          <svg
            width="60"
            height="60"
            viewBox="-30 -30 60 60"
            style={{
              position: "absolute",
              inset: 0,
              animation: "spin-slow 8s linear infinite"
            }}
          >
            <circle
              cx="0"
              cy="0"
              r="18"
              fill="none"
              stroke="var(--ons)"
              strokeWidth="1"
              strokeDasharray="2 6"
              opacity="0.7"
            />
          </svg>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {change.to.map((ch, i) => (
            <span
              key={i}
              className="tile tiny"
              style={{
                borderColor: "var(--ons)",
                color: "var(--ons)",
                background: "var(--ons-bg)",
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
