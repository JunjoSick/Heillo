"use client";

import {
  Fragment,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
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
import { sanitizeWordInput } from "@/lib/text/sanitizeWordInput";
import type { GameSettings, MoveValidation, PathEntry } from "@/lib/types";

const DEFAULT_START_WORD = "gioco";

function makeInitialPath(startWord: string): PathEntry[] {
  return [{ word: makePhoneticWord(startWord) }];
}

interface PathEntryWithOp extends PathEntry {
  op: ChainOp | null;
}

export default function Home() {
  const [startWord, setStartWord] = useState(DEFAULT_START_WORD);
  const [path, setPath] = useState<PathEntry[]>(() =>
    makeInitialPath(DEFAULT_START_WORD)
  );
  const [draft, setDraft] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [dictionary, setDictionary] = useState<string[]>([]);
  const [dictionaryError, setDictionaryError] = useState<string | null>(null);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [manualWord, setManualWord] = useState("");
  const [exportText, setExportText] = useState("");

  const chainScrollRef = useRef<HTMLElement>(null);
  const flashTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
        flashTimerRef.current = null;
      }
    };
  }, []);

  const dictionaryContext = useMemo(
    () => prepareDictionaryContext(dictionary, customWords),
    [dictionary, customWords]
  );

  // Classify every chain transition once per path change.
  const pathWithOps: PathEntryWithOp[] = useMemo(
    () =>
      path.map((entry, i) => ({
        ...entry,
        op:
          i === 0 ? null : classifyChain(path[i - 1].word.raw, entry.word.raw)
      })),
    [path]
  );

  const currentEntry = path[path.length - 1];
  const currentWord = currentEntry?.word.raw ?? "";

  // Live preview — instant, runs on every keystroke (cheap).
  const preview: { word: string; op: ChainOp } | null = useMemo(() => {
    const w = draft.trim().toLowerCase();
    if (!w || w === currentWord.toLowerCase()) return null;
    return { word: w, op: classifyChain(currentWord, w) };
  }, [draft, currentWord]);

  // Validation is expensive; defer it so typing stays responsive.
  const deferredPreview = useDeferredValue(preview);

  const validation: MoveValidation | null = useMemo(() => {
    if (!currentEntry || !deferredPreview) return null;
    if (
      deferredPreview.op.type === "invalid" ||
      deferredPreview.op.type === "noop"
    ) {
      return null;
    }
    return validateMove(
      currentEntry.word.raw,
      deferredPreview.word,
      settings,
      dictionaryContext
    );
  }, [deferredPreview, currentEntry, settings, dictionaryContext]);

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
      deferredPreview &&
      casefoldTrim(deferredPreview.word) === casefoldTrim(validation.to.raw) &&
      // Don't claim acceptance for a stale deferred value while the user is still typing.
      preview &&
      preview.word === deferredPreview.word
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
    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
    }
    flashTimerRef.current = window.setTimeout(() => {
      setFlash(null);
      flashTimerRef.current = null;
    }, 1800);
  }

  function handleAccept() {
    if (!preview || !currentEntry) return;
    const unsupported = getUnsupportedWordReason(preview.word);
    if (unsupported) {
      flashMessage(unsupported);
      return;
    }
    // Always re-run validation against the live draft so we don't accept off a stale deferred state.
    const next = validateMove(
      currentEntry.word.raw,
      preview.word,
      settings,
      dictionaryContext
    );
    const acc = canAcceptMove(acceptedMoves, next, settings);
    if (!acc.accepted) {
      flashMessage(acc.message);
      return;
    }
    setPath((p) => appendMove(p, next));
    setDraft("");
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
    setPath(makeInitialPath(startWord));
    setDraft("");
    flashMessage(`reset to ${startWord}`);
  }

  function commitStartWord(next: string) {
    const trimmed = next.trim().toLowerCase();
    if (!trimmed) return;
    const unsupported = getUnsupportedWordReason(trimmed);
    if (unsupported) {
      flashMessage(unsupported);
      return;
    }
    setStartWord(trimmed);
    setPath(makeInitialPath(trimmed));
    setDraft("");
    flashMessage(`new start: ${trimmed}`);
  }

  function addCustomWord(word: string) {
    const unsupported = getUnsupportedWordReason(word);
    if (unsupported) {
      flashMessage(unsupported);
      return;
    }
    const nextWords = saveCustomWord(word);
    setCustomWords(nextWords);
    setManualWord("");
    flashMessage(`${word.trim()} added`);
  }

  // Suggestions scan the dictionary; defer the inputs so settings tweaks or
  // an accept don't stall the urgent render while the scan runs.
  const deferredCurrentEntry = useDeferredValue(currentEntry);
  const deferredDictionaryContext = useDeferredValue(dictionaryContext);
  const deferredSettings = useDeferredValue(settings);
  const dockSuggestions = useMemo(() => {
    if (
      !deferredCurrentEntry ||
      deferredDictionaryContext.allWords.length === 0
    ) {
      return [] as string[];
    }
    return suggestNextWords(
      deferredCurrentEntry.word.raw,
      deferredDictionaryContext.allWords,
      deferredSettings,
      deferredDictionaryContext
    )
      .slice(0, 3)
      .map((s) => s.word);
  }, [deferredCurrentEntry, deferredDictionaryContext, deferredSettings]);

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

          {pathWithOps.map((entry, i) => {
            const isStart = i === 0;
            return (
              <Fragment key={i + "-" + entry.word.raw}>
                {!isStart && entry.op ? (
                  <div className="bridge-in">
                    <Bridge op={entry.op} />
                  </div>
                ) : null}
                <div className="row-in">
                  <WordRow
                    word={entry.word.raw}
                    op={entry.op}
                    isStart={isStart}
                    index={i}
                    latest={i === pathWithOps.length - 1 && !preview}
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
                    !canAccept &&
                    deferredPreview &&
                    deferredPreview.word === preview.word
                      ? acceptance?.message ?? null
                      : null
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
          <StartWordControl current={startWord} onCommit={commitStartWord} />
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
        fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
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
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
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
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
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
        fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
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
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
          fontSize: 11
        }}
      >
        ↵
      </kbd>{" "}
      to accept
    </div>
  );
}

function StartWordControl({
  current,
  onCommit
}: {
  current: string;
  onCommit: (next: string) => void;
}) {
  const [draft, setDraft] = useState(current);
  useEffect(() => {
    setDraft(current);
  }, [current]);

  return (
    <section className="min-w-0 rounded border border-moss/15 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-ink">Starting word</h2>
      <p className="mt-1 text-xs text-moss">
        Resets the chain to a new opening word.
      </p>
      <form
        className="mt-3 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          onCommit(draft);
        }}
      >
        <input
          className="h-10 w-full min-w-0 rounded border border-moss/25 bg-white px-3 text-sm"
          onChange={(event) =>
            setDraft(sanitizeWordInput(event.target.value).toLowerCase())
          }
          placeholder="gioco"
          value={draft}
        />
        <button
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded bg-moss px-3 text-sm font-semibold text-white"
          type="submit"
        >
          Set start
        </button>
      </form>
    </section>
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
              fontFamily:
                'var(--font-instrument-serif), "Instrument Serif", serif',
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
