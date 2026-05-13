import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";
import { plusBadge } from "./bridgeUtils";

export function BridgeInsertion({
  change,
  source
}: {
  change: VisualChange;
  source: BridgeSource;
}) {
  const letter = change.to[0] ?? "·";
  return (
    <BridgeShell
      tint="var(--ins)"
      accentLabel="insertion"
      accentDetail={change.description}
      source={source}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "relative"
        }}
      >
        <span
          className="tile tiny"
          style={{
            borderColor: "var(--ins)",
            color: "var(--moss)",
            background: "#fff",
            animation: "split-x 2.6s cubic-bezier(.5,0,.5,1) infinite alternate"
          }}
        >
          ·
        </span>
        <div
          style={{
            position: "relative",
            width: 50,
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Sparkles color="var(--ins)" />
          <span
            className="tile small"
            style={{
              borderColor: "var(--ins)",
              background: "var(--ins-bg)",
              color: "var(--ins)",
              fontWeight: 500,
              animation: "pulse-soft 2.6s ease-in-out infinite"
            }}
          >
            {letter}
          </span>
          <span style={plusBadge("var(--ins)")}>+</span>
        </div>
        <span
          className="tile tiny"
          style={{
            borderColor: "var(--ins)",
            color: "var(--moss)",
            background: "#fff",
            animation: "split-x-r 2.6s cubic-bezier(.5,0,.5,1) infinite alternate"
          }}
        >
          ·
        </span>
      </div>
    </BridgeShell>
  );
}

function Sparkles({ color }: { color: string }) {
  const dots = [
    { x: -22, y: 0, d: 0 },
    { x: 22, y: 0, d: 0.4 },
    { x: 0, y: -22, d: 0.8 },
    { x: 0, y: 22, d: 1.2 },
    { x: -16, y: -16, d: 0.2 },
    { x: 16, y: 16, d: 1.0 }
  ];
  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 4,
            height: 4,
            borderRadius: 999,
            background: color,
            transform: `translate(calc(-50% + ${d.x}px), calc(-50% + ${d.y}px))`,
            animation: `blink-dot 1.8s ease-in-out ${d.d}s infinite`
          }}
        />
      ))}
    </>
  );
}
