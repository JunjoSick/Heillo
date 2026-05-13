import { useId, type CSSProperties, type ReactNode } from "react";
import type { ChainOp } from "./diff";

const HEIGHT = 96;

export function Bridge({ op }: { op: ChainOp | null }) {
  if (!op || op.type === "noop" || op.type === "invalid") return <BridgeNoop />;
  switch (op.type) {
    case "substitution":
      return <BridgeSubstitution op={op} />;
    case "insertion":
      return <BridgeInsertion op={op} />;
    case "deletion":
      return <BridgeDeletion op={op} />;
    case "swap":
      return <BridgeSwap op={op} />;
    case "lengthening":
      return <BridgeLengthening op={op} />;
    case "shortening":
      return <BridgeShortening op={op} />;
    case "cluster-change":
      return <BridgeCluster op={op} />;
    case "onset-change":
      return <BridgeOnset op={op} />;
    default:
      return <BridgeNoop />;
  }
}

function BridgeShell({
  tint,
  children,
  accentLabel,
  accentDetail
}: {
  tint: string;
  children: ReactNode;
  accentLabel: string;
  accentDetail?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr 130px",
        alignItems: "center",
        columnGap: 12,
        padding: "8px 0",
        minHeight: HEIGHT
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 2,
            height: HEIGHT - 12,
            background: `linear-gradient(${tint}55, ${tint} 50%, ${tint}55)`,
            borderRadius: 2
          }}
        />
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        {children}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          className="pill"
          style={{ background: "transparent", borderColor: tint, color: tint }}
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
      </div>
    </div>
  );
}

function BridgeNoop() {
  return (
    <div
      style={{
        height: 40,
        display: "grid",
        gridTemplateColumns: "36px 1fr 130px",
        alignItems: "center",
        columnGap: 12
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: 2, height: 24, background: "var(--rule-line)" }} />
      </div>
    </div>
  );
}

const plusBadge = (color: string): CSSProperties => ({
  position: "absolute",
  top: -8,
  right: -8,
  width: 18,
  height: 18,
  borderRadius: 999,
  background: color,
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1
});

/* ── 1. SUBSTITUTION ───────────────────────────────────────────── */
function BridgeSubstitution({
  op
}: {
  op: Extract<ChainOp, { type: "substitution" }>;
}) {
  const arrowId = useId();
  return (
    <BridgeShell
      tint="var(--sub)"
      accentLabel="substitution"
      accentDetail={`${op.from} → ${op.to}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <FlipPair from={op.from} to={op.to} />
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
          {op.to}
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

/* ── 2. INSERTION ──────────────────────────────────────────────── */
function BridgeInsertion({
  op
}: {
  op: Extract<ChainOp, { type: "insertion" }>;
}) {
  return (
    <BridgeShell
      tint="var(--ins)"
      accentLabel="insertion"
      accentDetail={`+${op.letter} at ${op.at + 1}`}
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
            {op.letter}
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

/* ── 3. DELETION ───────────────────────────────────────────────── */
function BridgeDeletion({
  op
}: {
  op: Extract<ChainOp, { type: "deletion" }>;
}) {
  return (
    <BridgeShell
      tint="var(--del)"
      accentLabel="deletion"
      accentDetail={`−${op.letter}`}
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
            {op.letter}
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

/* ── 4. SWAP ───────────────────────────────────────────────────── */
function BridgeSwap({ op }: { op: Extract<ChainOp, { type: "swap" }> }) {
  const arrowId = useId();
  const a = op.from[0] || "·";
  const b = op.from[1] || "·";
  return (
    <BridgeShell tint="var(--swp)" accentLabel="swap" accentDetail={`${a} ⇄ ${b}`}>
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
            {op.to[0]}
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
            {op.to[1]}
          </span>
        </div>
      </div>
    </BridgeShell>
  );
}

/* ── 5. LENGTHENING ────────────────────────────────────────────── */
function BridgeLengthening({
  op
}: {
  op: Extract<ChainOp, { type: "lengthening" }>;
}) {
  const arrowId = useId();
  return (
    <BridgeShell
      tint="var(--len)"
      accentLabel="lengthening"
      accentDetail={`${op.letter} → ${op.letter}${op.letter}`}
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
          {op.letter}
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
            {op.letter}
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
            {op.letter}
          </span>
        </div>
        <div
          style={{
            marginLeft: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <div
            style={{
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
      </div>
    </BridgeShell>
  );
}

/* ── 6. SHORTENING ─────────────────────────────────────────────── */
function BridgeShortening({
  op
}: {
  op: Extract<ChainOp, { type: "shortening" }>;
}) {
  const arrowId = useId();
  return (
    <BridgeShell
      tint="var(--shr)"
      accentLabel="shortening"
      accentDetail={`${op.letter}${op.letter} → ${op.letter}`}
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
            {op.letter}
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
            {op.letter}
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
          {op.letter}
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

/* ── 7. CLUSTER-CHANGE ─────────────────────────────────────────── */
function BridgeCluster({
  op
}: {
  op: Extract<ChainOp, { type: "cluster-change" }>;
}) {
  const arrowId = useId();
  return (
    <BridgeShell
      tint="var(--clu)"
      accentLabel="cluster"
      accentDetail={`${op.from} → ${op.to}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Brace side="left" color="var(--clu)" />
        <div style={{ display: "flex", gap: 3 }}>
          {op.from.split("").map((ch, i) => (
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
          {op.to.split("").map((ch, i) => (
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

/* ── 8. ONSET-CHANGE ───────────────────────────────────────────── */
function BridgeOnset({
  op
}: {
  op: Extract<ChainOp, { type: "onset-change" }>;
}) {
  return (
    <BridgeShell
      tint="var(--ons)"
      accentLabel="onset"
      accentDetail={`${op.from} → ${op.to}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", gap: 3 }}>
          {op.from.split("").map((ch, i) => (
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
          {op.to.split("").map((ch, i) => (
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
