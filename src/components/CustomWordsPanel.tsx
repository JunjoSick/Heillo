"use client";

import { Download, Plus } from "lucide-react";

interface CustomWordsPanelProps {
  customWords: string[];
  manualWord: string;
  exportText: string;
  onManualWordChange: (word: string) => void;
  onAddWord: () => void;
  onExport: () => void;
}

export function CustomWordsPanel({
  customWords,
  manualWord,
  exportText,
  onManualWordChange,
  onAddWord,
  onExport
}: CustomWordsPanelProps) {
  return (
    <section className="min-w-0 rounded border border-moss/15 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-ink">Custom Words</h2>
      <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          className="h-10 w-full min-w-0 rounded border border-moss/25 bg-white px-3 text-sm"
          onChange={(event) => onManualWordChange(event.target.value)}
          placeholder="correvo"
          value={manualWord}
        />
        <button
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded bg-moss px-3 text-sm font-semibold text-white"
          onClick={onAddWord}
          title="Add custom word"
          type="button"
        >
          <Plus aria-hidden size={17} />
          <span>Add word</span>
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {customWords.length === 0 ? (
          <span className="text-sm text-moss">No custom words.</span>
        ) : (
          customWords.map((word) => (
            <span
              className="rounded border border-moss/15 bg-paper px-2 py-1 text-xs font-semibold text-ink"
              key={word}
            >
              {word}
            </span>
          ))
        )}
      </div>
      <button
        className="mt-4 inline-flex h-10 items-center gap-2 rounded border border-moss/25 bg-white px-3 text-sm font-semibold text-ink"
        onClick={onExport}
        title="Export custom words JSON"
        type="button"
      >
        <Download aria-hidden size={17} />
        <span>Export JSON</span>
      </button>
      {exportText ? (
        <textarea
          className="mt-3 min-h-32 w-full rounded border border-moss/20 bg-paper p-3 font-mono text-xs"
          readOnly
          value={exportText}
        />
      ) : null}
    </section>
  );
}
