"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Bridge } from "@/components/chain/Bridge";
import { DockInput } from "@/components/chain/DockInput";
import { Legend } from "@/components/chain/Legend";
import { TopBar } from "@/components/chain/TopBar";
import { WordRow } from "@/components/chain/WordRow";
import { classifyChain, type ChainOp } from "@/components/chain/diff";
import { CustomWordsPanel } from "@/components/CustomWordsPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import {
  loadCustomWords,
  saveCustomWord
} from "@/lib/dictionary/customWords";
import { exportCustomWords } from "@/lib/dictionary/exportCustomWords";
import { loadDictionary } from "@/lib/dictionary/loadDictionary";
import { prepareDictionaryContext } from "@/lib/dictionary/dictionaryContext";
import {
  casefoldTrim,
  getUnsupportedWordReason,
  makePhoneticWord,
  suggestNextWords,
  validateMove
} from "@/lib/phonetics";
import { appendMove, canAcceptMove } from "@/lib/path/pathRules";
import { defaultSettings } from "@/lib/settings/defaultSettings";
import type {
  GameSettings,
  MoveValidation,
  PathEntry,
  Suggestion
} from "@/lib/types";

const START_WORD = "gioco";

function makeInitialPath(): PathEntry[] {
  return [{ word: makePhoneticWord(START_WORD) }];
}

export default function Home() {
  const [path, setPath] = useState<PathEntry[]>(() => makeInitialPath());
  const [draft, setDraft] = useState("");
  const [validation, setValidation] = useState<MoveValidation | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [dictionary, setDictionary] = useState<string[]>([]);
  const [dictionaryError, setDictionaryError] = useState<string | null>(null);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [manualWord, setManualWord] = useState("");
  const [exportText, setExportText] = useState("");

  const chainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setCustomWords(loadCustomWords());
    loadDictionary()
      .then((words) => {
        setDictionary(words);
        setDictionaryError(null);
      })
      .catch((error: unknown) => {
        setDictionaryError(
          error instanceof Error ? error.message : "Dictionary load failed."
        );
      });
  }, []);

  const dictionaryContext = useMemo(
    () => prepareDictionaryContext(dictionary, customWords),
    [dictionary, customWords]
  );

  const currentEntry = path[path.length - 1];
  const currentWord = currentEntry?.word.raw ?? "";

  // Live preview op from the char-level diff (visual classification only).
  const preview: { word: string; op: ChainOp } | null = useMemo(() => {
    const w = draft.trim().toLowerCase();
    if (!w || w === currentWord.toLowerCase()) return null;
    return { word: w, op: classifyChain(currentWord, w) };
  }, [draft, currentWord]);

  // Compute validation in response to draft changes so we can decide acceptability.
  useEffect(() => {
    if (!currentEntry || !preview) {
      setValidation(null);
      return;
    }
    if (preview.op.type === "invalid" || preview.op.type === "noop") {
      setValidation(null);
      return;
    }
    const next = validateMove(
      currentEntry.word.raw,
      preview.word,
      settings,
      dictionaryContext
    );
    setValidation(next);
  }, [preview, currentEntry, settings, dictionaryContext]);

  const acceptedMoves = useMemo(
    () => path.map((e) => e.move).filter(Boolean) as MoveValidation[],
    [path]
  );
  const acceptance = useMemo(
    () =>
      validation ? canAcceptMove(acceptedMoves, validation, settings) : null,
    [acceptedMoves, settings, validation]
  );

  const canAccept = Boolean(
    validation &&
      acceptance?.accepted &&
      preview &&
      casefoldTrim(preview.word) === casefoldTrim(validation.to.raw)
  );

  // Auto-scroll to bottom when path grows or preview changes.
  useEffect(() => {
    const el = chainScrollRef.current;
    if (!el) return;
    const id = window.requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [path.length, preview?.word]);

  function flashMessage(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash((cur) => (cur === message ? null : cur)), 1800);
  }

  function handleAccept() {
    if (!preview || !currentEntry) return;
    const unsupported = getUnsupportedWordReason(preview.word);
    if (unsupported) {
      flashMessage(unsupported);
      return;
    }
    if (!validation) {
      const next = validateMove(
        currentEntry.word.raw,
        preview.word,
        settings,
        dictionaryContext
      );
      setValidation(next);
      const acc = canAcceptMove(acceptedMoves, next, settings);
      if (!acc.accepted) {
        flashMessage(acc.message);
        return;
      }
      setPath((p) => appendMove(p, next));
      setDraft("");
      setValidation(null);
      flashMessage(`accepted: ${preview.word}`);
      return;
    }
    if (!acceptance?.accepted) {
      flashMessage(acceptance?.message ?? "invalid move");
      return;
    }
    setPath((p) => appendMove(p, validation));
    setDraft("");
    setValidation(null);
    flashMessage(`accepted: ${preview.word}`);
  }

  function handleUndo() {
    if (path.length <= 1) {
      flashMessage("nothing to undo");
      return;
    }
    setPath((p) => p.slice(0, -1));
    flashMessage("undid one step");
  }

  function handleReset() {
    setPath(makeInitialPath());
    setDraft("");
    setValidation(null);
    flashMessage("reset to start");
  }

  function addCustomWord(word: string) {
    const unsupported = getUnsupportedWordReason(word);
    if (unsupported) {
      flashMessage(unsupported);
      return;
    }
    const next = saveCustomWord(word);
    setCustomWords(next);
    setManualWord("");
    flashMessage(`${word.trim()} added`);
  }

  const dockSuggestions = useMemo(() => {
    if (!currentEntry || dictionaryContext.allWords.length === 0) return [] as string[];
    if (suggestions.length > 0) return suggestions.slice(0, 3).map((s) => s.word);
    const cheap = suggestNextWords(
      currentEntry.word.raw,
      dictionaryContext.allWords,
      settings,
      dictionaryContext
    );
    return cheap.slice(0, 3).map((s) => s.word);
  }, [currentEntry, dictionaryContext, settings, suggestions]);

  useEffect(() => {
    setSuggestions([]);
  }, [path.length]);

  const buttonLabel = preview ? (canAccept ? "accept" : "verify") : "verify";

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: "var(--paper)"
      }}
    >
      <TopBar
        onMenuClick={() => setMenuOpen((v) => !v)}
        menuOpen={menuOpen}
      />
      <Legend />

      <main
        ref={chainScrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
          scrollbarWidth: "thin"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            maxWidth: 720,
            margin: "0 auto",
            padding: "16px 24px 24px",
            gap: 4,
            minHeight: "100%",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          <div style={{ flex: 1, minHeight: 12 }} />

          {path.map((entry, i) => {
            const isStart = i === 0;
            const op: ChainOp | null = isStart
              ? null
              : classifyChain(path[i - 1].word.raw, entry.word.raw);
            return (
              <Fragment key={i + "-" + entry.word.raw}>
                {!isStart && op ? (
                  <div className="bridge-in">
                    <Bridge op={op} />
                  </div>
                ) : null}
                <div className="row-in">
                  <WordRow
                    word={entry.word.raw}
                    op={op}
                    isStart={isStart}
                    index={i}
                    latest={i === path.length - 1 && !preview}
                  />
                  {isStart ? <StartCaption /> : null}
                </div>
              </Fragment>
            );
          })}

          {preview ? (
            <>
              <div className="bridge-in" key={"pv-br-" + preview.word}>
                <Bridge op={preview.op} />
              </div>
              <div
                className="row-in"
                key={"pv-row-" + preview.word}
                style={{ opacity: 0.96 }}
              >
                <WordRow
                  word={preview.word}
                  op={preview.op}
                  isStart={false}
                  index={path.length}
                  latest
                />
                <PreviewCaption
                  op={preview.op}
                  canAccept={canAccept}
                  acceptanceMessage={
                    !canAccept ? acceptance?.message ?? null : null
                  }
                />
              </div>
            </>
          ) : null}

          <div style={{ height: 24 }} />
        </div>
      </main>

      <DockInput
        value={draft}
        onChange={setDraft}
        onAccept={handleAccept}
        buttonLabel={buttonLabel}
        canAccept={canAccept}
        onUndo={handleUndo}
        onReset={handleReset}
        stepNumber={path.length}
        flash={flash}
        suggestions={dockSuggestions}
        onPickSuggestion={setDraft}
      />

      {menuOpen ? (
        <SidePanel onClose={() => setMenuOpen(false)}>
          {dictionaryError ? (
            <div
              style={{
                margin: "0 0 12px",
                padding: "8px 10px",
                borderRadius: 8,
                background: "var(--del-bg)",
                color: "var(--del)",
                fontSize: 12
              }}
            >
              {dictionaryError}
            </div>
          ) : null}
          <SettingsPanel settings={settings} onChange={setSettings} />
          <CustomWordsPanel
            customWords={customWords}
            exportText={exportText}
            manualWord={manualWord}
            onAddWord={() => addCustomWord(manualWord)}
            onExport={() => setExportText(exportCustomWords(customWords))}
            onManualWordChange={setManualWord}
          />
        </SidePanel>
      ) : null}
    </div>
  );
}

function StartCaption() {
  return (
    <div
      style={{
        textAlign: "center",
        margin: "6px 0 14px",
        fontFamily: '"Instrument Serif", serif',
        fontSize: 18,
        fontStyle: "italic",
        color: "var(--moss)"
      }}
    >
      ↑ scroll up to wander back to the start — ↓ keep going
    </div>
  );
}

function PreviewCaption({
  op,
  canAccept,
  acceptanceMessage
}: {
  op: ChainOp;
  canAccept: boolean;
  acceptanceMessage: string | null;
}) {
  if (op.type === "noop") return null;
  if (op.type === "invalid") {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: 6,
          color: "var(--del)",
          fontFamily: '"Geist Mono", monospace',
          fontSize: 11
        }}
      >
        invalid move
      </div>
    );
  }
  if (!canAccept && acceptanceMessage) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: 6,
          color: "var(--del)",
          fontFamily: '"Geist Mono", monospace',
          fontSize: 11,
          letterSpacing: "0.04em"
        }}
      >
        {acceptanceMessage}
      </div>
    );
  }
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 6,
        fontFamily: '"Geist Mono", monospace',
        fontSize: 11,
        color: "var(--moss)",
        letterSpacing: "0.04em"
      }}
    >
      preview — press{" "}
      <kbd
        style={{
          display: "inline-block",
          padding: "1px 6px",
          borderRadius: 5,
          background: "#fff",
          border: "1px solid rgba(20,18,12,0.18)",
          fontFamily: '"Geist Mono", monospace',
          fontSize: 11
        }}
      >
        ↵
      </kbd>{" "}
      to accept
    </div>
  );
}

function SidePanel({
  children,
  onClose
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20,18,12,0.18)",
          zIndex: 50
        }}
      />
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 92vw)",
          background: "var(--paper)",
          borderLeft: "1px solid rgba(20,18,12,0.1)",
          boxShadow: "-20px 0 40px -20px rgba(20,18,12,0.25)",
          zIndex: 51,
          overflow: "auto",
          padding: 18,
          display: "grid",
          gap: 18,
          alignContent: "start"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: '"Instrument Serif", serif',
              fontSize: 28,
              fontWeight: 400
            }}
          >
            Tweaks
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="pill"
            style={{ background: "#fff" }}
          >
            close
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
