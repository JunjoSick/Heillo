"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { sanitizeWordInput } from "@/lib/text/sanitizeWordInput";

interface DockInputProps {
  value: string;
  onChange: (next: string) => void;
  onAccept: () => void;
  buttonLabel: string;
  canAccept: boolean;
  onUndo: () => void;
  onReset: () => void;
  stepNumber: number;
  flash?: string | null;
  suggestions?: string[];
  onPickSuggestion?: (word: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DockInput({
  value,
  onChange,
  onAccept,
  buttonLabel,
  canAccept,
  onUndo,
  onReset,
  stepNumber,
  flash,
  suggestions = [],
  onPickSuggestion,
  disabled = false,
  placeholder = "type next word…"
}: DockInputProps) {
  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      onAccept();
    }
  }

  return (
    <div
      style={{
        flexShrink: 0,
        zIndex: 6,
        padding: "14px 16px 18px",
        borderTop: "1px solid rgba(20,18,12,0.07)",
        background: "linear-gradient(transparent, var(--paper) 40%)"
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: 720,
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 10,
          alignItems: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "6px 10px",
            background: "#fff",
            border: "1px solid rgba(20,18,12,0.12)",
            borderRadius: 12,
            minWidth: 54
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
              fontSize: 10,
              color: "var(--moss)",
              letterSpacing: "0.06em"
            }}
          >
            STEP
          </span>
          <span
            style={{
              fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
              fontSize: 24,
              lineHeight: 1
            }}
          >
            {stepNumber}
          </span>
        </div>

        <label style={{ position: "relative", display: "block" }}>
          <input
            value={value}
            onChange={(e) => onChange(sanitizeWordInput(e.target.value))}
            onKeyDown={handleKey}
            placeholder={placeholder}
            spellCheck={false}
            autoFocus
            disabled={disabled}
            style={{
              width: "100%",
              height: 54,
              padding: "10px 110px 10px 16px",
              background: "#fff",
              border: "1.5px solid rgba(20,18,12,0.18)",
              borderRadius: 12,
              fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
              fontSize: 28,
              fontWeight: 400,
              outline: "none",
              letterSpacing: -0.01
            }}
          />
          {flash ? (
            <span
              style={{
                position: "absolute",
                right: 120,
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                fontSize: 10,
                color: "var(--moss)"
              }}
            >
              {flash}
            </span>
          ) : null}
          <button
            onClick={onAccept}
            disabled={disabled}
            type="button"
            style={{
              position: "absolute",
              right: 6,
              top: 6,
              height: 42,
              padding: "0 16px",
              borderRadius: 8,
              background: canAccept ? "var(--ink)" : "rgba(20,18,12,0.1)",
              color: canAccept ? "var(--paper)" : "var(--moss)",
              fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "all 220ms ease",
              cursor: disabled ? "not-allowed" : "pointer"
            }}
          >
            {canAccept ? "accept ↵" : buttonLabel}
          </button>
        </label>

        <div style={{ display: "flex", gap: 6 }}>
          <IconButton onClick={onUndo} title="Undo last step">
            ⌫
          </IconButton>
          <IconButton onClick={onReset} title="Reset path">
            ↺
          </IconButton>
        </div>
      </div>

      <div
        style={{
          margin: "8px auto 0",
          maxWidth: 720,
          textAlign: "center",
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
          fontSize: 10,
          color: "var(--moss)",
          letterSpacing: "0.06em",
          textTransform: "uppercase"
        }}
      >
        {suggestions.length > 0 && onPickSuggestion ? (
          <>
            try:{" "}
            <span
              style={{
                display: "inline-flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center"
              }}
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPickSuggestion(s)}
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(20,18,12,0.15)",
                    background: "#fff",
                    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                    fontSize: 10,
                    color: "var(--ink)",
                    textTransform: "lowercase",
                    letterSpacing: "0.04em"
                  }}
                >
                  {s}
                </button>
              ))}
            </span>
          </>
        ) : (
          <span style={{ opacity: 0.6 }}>
            press ↵ to verify · ⌫ undo · ↺ reset
          </span>
        )}
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  title
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  const style: CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "#fff",
    border: "1px solid rgba(20,18,12,0.12)",
    fontSize: 18,
    color: "var(--ink)"
  };
  return (
    <button type="button" onClick={onClick} title={title} style={style}>
      {children}
    </button>
  );
}
