"use client";

import type { LucideIcon } from "lucide-react";

interface WordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  buttonLabel: string;
  icon: LucideIcon;
  disabled?: boolean;
  placeholder?: string;
}

export function WordInput({
  label,
  value,
  onChange,
  onSubmit,
  buttonLabel,
  icon: Icon,
  disabled = false,
  placeholder
}: WordInputProps) {
  return (
    <form
      className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="grid min-w-0 gap-1.5 text-sm font-semibold text-ink">
        {label}
        <input
          className="h-11 w-full min-w-0 rounded border border-moss/25 bg-white px-3 text-base text-ink shadow-sm"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </label>
      <button
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        title={buttonLabel}
        type="submit"
      >
        <Icon aria-hidden size={18} />
        <span>{buttonLabel}</span>
      </button>
    </form>
  );
}
