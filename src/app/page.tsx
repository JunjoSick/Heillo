"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Search } from "lucide-react";
import { CustomWordsPanel } from "@/components/CustomWordsPanel";
import { MoveResult } from "@/components/MoveResult";
import { OnboardingBox } from "@/components/OnboardingBox";
import { PathView } from "@/components/PathView";
import { PhonemeView } from "@/components/PhonemeView";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SuggestionsPanel } from "@/components/SuggestionsPanel";
import { WordInput } from "@/components/WordInput";
import {
  loadCustomWords,
  saveCustomWord
} from "@/lib/dictionary/customWords";
import { exportCustomWords } from "@/lib/dictionary/exportCustomWords";
import { loadDictionary } from "@/lib/dictionary/loadDictionary";
import { prepareDictionaryContext } from "@/lib/dictionary/dictionaryContext";
import {
  getUnsupportedWordReason,
  makePhoneticWord,
  suggestNextWords,
  validateMove
} from "@/lib/phonetics";
import { appendMove, canAcceptMove } from "@/lib/path/pathRules";
import { defaultSettings } from "@/lib/settings/defaultSettings";
import type { GameSettings, MoveValidation, PathEntry, Suggestion } from "@/lib/types";

export default function Home() {
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [dictionaryError, setDictionaryError] = useState<string | null>(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(true);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [startInput, setStartInput] = useState("gioco");
  const [candidateInput, setCandidateInput] = useState("");
  const [path, setPath] = useState<PathEntry[]>([]);
  const [validation, setValidation] = useState<MoveValidation | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [manualWord, setManualWord] = useState("");
  const [exportText, setExportText] = useState("");

  useEffect(() => {
    setCustomWords(loadCustomWords());

    loadDictionary()
      .then((words) => {
        setDictionary(words);
        setDictionaryError(null);
      })
      .catch((error: unknown) => {
        setDictionaryError(error instanceof Error ? error.message : "Dictionary load failed.");
      })
      .finally(() => setDictionaryLoading(false));
  }, []);

  const dictionaryContext = useMemo(
    () => prepareDictionaryContext(dictionary, customWords),
    [dictionary, customWords]
  );

  const currentEntry = path[path.length - 1];
  const hasValidation = validation !== null;
  const acceptedMoves = useMemo(
    () => path.map((entry) => entry.move).filter(Boolean) as MoveValidation[],
    [path]
  );
  const acceptance = useMemo(
    () =>
      validation
        ? canAcceptMove(acceptedMoves, validation, settings)
        : null,
    [acceptedMoves, settings, validation]
  );

  useEffect(() => {
    if (!currentEntry || !candidateInput || !hasValidation) {
      return;
    }

    setValidation(
      validateMove(currentEntry.word.raw, candidateInput, settings, dictionaryContext)
    );
  }, [settings, dictionaryContext, currentEntry, candidateInput, hasValidation]);

  function startPath() {
    const unsupported = getUnsupportedWordReason(startInput);

    if (unsupported) {
      setMessage(unsupported);
      return;
    }

    setPath([{ word: makePhoneticWord(startInput) }]);
    setCandidateInput("");
    setValidation(null);
    setSuggestions([]);
    setMessage(null);
  }

  function verifyCandidate(word = candidateInput) {
    if (!currentEntry) {
      setMessage("Start a word before verifying a candidate.");
      return;
    }

    const unsupported = getUnsupportedWordReason(word);

    if (unsupported) {
      setMessage(unsupported);
      return;
    }

    setCandidateInput(word);
    setValidation(validateMove(currentEntry.word.raw, word, settings, dictionaryContext));
    setMessage(null);
  }

  function acceptMove() {
    if (!validation || !acceptance?.accepted) {
      return;
    }

    setPath((currentPath) => appendMove(currentPath, validation));
    setCandidateInput("");
    setValidation(null);
    setSuggestions([]);
    setMessage("Move accepted.");
  }

  function addCustomWord(word: string) {
    const unsupported = getUnsupportedWordReason(word);

    if (unsupported) {
      setMessage(unsupported);
      return;
    }

    const nextWords = saveCustomWord(word);
    setCustomWords(nextWords);
    setManualWord("");
    setMessage(`${word.trim()} added to local overrides.`);
  }

  function generateSuggestions() {
    if (!currentEntry) {
      setMessage("Start a word before generating suggestions.");
      return;
    }

    setSuggestionsLoading(true);
    setMessage(null);

    window.setTimeout(() => {
      const nextSuggestions = suggestNextWords(
        currentEntry.word.raw,
        dictionaryContext.allWords,
        settings,
        dictionaryContext
      );
      setSuggestions(nextSuggestions);
      setSuggestionsLoading(false);
    }, 0);
  }

  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-moss/15 bg-mist">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[1fr_22rem] lg:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-clay">
              Heillo
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
              Italian phonetic move tester
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-moss">
              Deterministic move validation for roadmap playtesting: transcribe,
              compare, explain, tune, and accept path progress.
            </p>
          </div>
          <div className="rounded border border-moss/15 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-ink">Dictionary</div>
            <div className="mt-2 text-3xl font-semibold text-ink">
              {dictionaryLoading ? "..." : dictionary.length.toLocaleString()}
            </div>
            <div className="mt-1 text-sm text-moss">loaded words</div>
            {dictionaryError ? (
              <p className="mt-2 text-sm text-clay">{dictionaryError}</p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-6">
        <div className="grid gap-5">
          <section className="rounded border border-moss/15 bg-white p-4 shadow-sm">
            <WordInput
              buttonLabel="Start"
              icon={Play}
              label="Starting word"
              onChange={setStartInput}
              onSubmit={startPath}
              placeholder="gioco"
              value={startInput}
            />
            {currentEntry ? (
              <div className="mt-4 grid gap-2">
                <div className="text-sm font-semibold text-moss">
                  Current phonemes
                </div>
                <PhonemeView phonemes={currentEntry.word.phonemes} />
                <div className="text-xs text-moss">
                  Input: {currentEntry.word.raw} · Normalized:{" "}
                  {currentEntry.word.normalized}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded border border-moss/15 bg-white p-4 shadow-sm">
            <WordInput
              buttonLabel="Verify"
              disabled={!currentEntry}
              icon={Search}
              label="Next word"
              onChange={setCandidateInput}
              onSubmit={() => verifyCandidate()}
              placeholder="geco"
              value={candidateInput}
            />
          </section>

          {message ? (
            <div className="rounded border border-gold/30 bg-gold/15 px-4 py-3 text-sm text-ink">
              {message}
            </div>
          ) : null}

          <MoveResult
            acceptance={acceptance}
            onAccept={acceptMove}
            onAcceptWord={() => validation && addCustomWord(validation.to.raw)}
            validation={validation}
          />

          <PathView
            maxCompoundStreak={settings.maxCompoundStreak}
            onReset={() => {
              setPath([]);
              setValidation(null);
              setSuggestions([]);
              setMessage(null);
            }}
            path={path}
          />

          <SuggestionsPanel
            disabled={!currentEntry || dictionaryContext.allWords.length === 0}
            loading={suggestionsLoading}
            onGenerate={generateSuggestions}
            onUseSuggestion={verifyCandidate}
            suggestions={suggestions}
          />

          <OnboardingBox />
        </div>

        <aside className="grid content-start gap-5">
          <SettingsPanel onChange={setSettings} settings={settings} />
          <CustomWordsPanel
            customWords={customWords}
            exportText={exportText}
            manualWord={manualWord}
            onAddWord={() => addCustomWord(manualWord)}
            onExport={() => setExportText(exportCustomWords(customWords))}
            onManualWordChange={setManualWord}
          />
        </aside>
      </div>
    </main>
  );
}
