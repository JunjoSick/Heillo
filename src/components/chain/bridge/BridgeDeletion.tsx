import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";
import { plusBadge } from "./bridgeUtils";

export function BridgeDeletion({
  change,
  source
}: {
  change: VisualChange;
  source: BridgeSource;
}) {
  const letter = change.from[0] ?? "·";
  return (
    <BridgeShell
      tint="var(--del)"
      accentLabel="deletion"
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
            borderColor: "var(--del)",
            color: "var(--moss)",
            background: "#fff",
            animation: "merge-x 2.4s cubic-bezier(.5,0,.5,1) infinite alternate"
          }}
        >
          ·
        </span>
        <div style={{ position: "relative", width: 50, height: 60 }}>
          <span
            className="tile small"
            style={{
              position: "absolute",
              left: "50%",
              top: 8,
              transform: "translate(-50%, 0)",
              borderColor: "var(--del)",
              background: "var(--del-bg)",
              color: "var(--del)",
              opacity: 0.85,
              animation: "float-up 2.4s cubic-bezier(.4,.2,.4,1) infinite"
            }}
          >
            {letter}
          </span>
          <svg
            width="42"
            height="42"
            viewBox="0 0 42 42"
            style={{ position: "absolute", left: 4, top: 4 }}
          >
            <line
              x1="6"
              y1="36"
              x2="36"
              y2="6"
              stroke="var(--del)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <span style={plusBadge("var(--del)")}>−</span>
        </div>
        <span
          className="tile tiny"
          style={{
            borderColor: "var(--del)",
            color: "var(--moss)",
            background: "#fff",
            animation: "merge-x-r 2.4s cubic-bezier(.5,0,.5,1) infinite alternate"
          }}
        >
          ·
        </span>
      </div>
    </BridgeShell>
  );
}
