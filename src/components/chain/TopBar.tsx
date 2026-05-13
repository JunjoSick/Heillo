interface TopBarProps {
  onMenuClick?: () => void;
  menuOpen?: boolean;
}

export function TopBar({ onMenuClick, menuOpen }: TopBarProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        padding: "18px 24px 14px",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        background: "linear-gradient(var(--paper) 60%, transparent)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)"
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
            fontSize: 44,
            lineHeight: 0.9,
            letterSpacing: -0.01,
            fontWeight: 400
          }}
        >
          Heillo
          <span style={{ color: "var(--moss-soft)", fontStyle: "italic" }}>.</span>
        </h1>
        <span
          style={{
            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
            fontSize: 11,
            color: "var(--moss)",
            letterSpacing: "0.06em",
            textTransform: "uppercase"
          }}
        >
          a chain of italian sounds
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span className="pill" style={{ background: "#fff" }}>
          <span style={{ color: "var(--moss)" }}>v</span>0.1
        </span>
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-expanded={menuOpen}
            aria-label="Toggle settings"
            className="pill"
            style={{
              background: menuOpen ? "var(--ink)" : "#fff",
              color: menuOpen ? "var(--paper)" : "var(--ink)",
              borderColor: menuOpen ? "var(--ink)" : "rgba(20,18,12,0.12)"
            }}
          >
            menu
          </button>
        ) : null}
      </div>
    </header>
  );
}
