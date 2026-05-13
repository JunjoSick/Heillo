"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { GameSettings } from "@/lib/types";

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
}

const numericSettings: Array<{
  key: keyof GameSettings;
  label: string;
  step: number;
  min: number;
}> = [
  { key: "smoothMax", label: "smoothMax", step: 0.5, min: 0 },
  { key: "validMax", label: "validMax", step: 0.5, min: 0 },
  { key: "borderlineMax", label: "borderlineMax", step: 0.5, min: 0 },
  { key: "maxCompoundStreak", label: "maxCompoundStreak", step: 1, min: 0 },
  { key: "insertVowelCost", label: "insertVowelCost", step: 0.5, min: 0 },
  { key: "insertSemivowelCost", label: "insertSemivowelCost", step: 0.5, min: 0 },
  { key: "insertConsonantCost", label: "insertConsonantCost", step: 0.5, min: 0 },
  { key: "lengthMismatchCost", label: "lengthMismatchCost", step: 0.5, min: 0 },
  { key: "specialFallbackCost", label: "specialFallbackCost", step: 0.5, min: 0 },
  { key: "swapBaseCost", label: "swapBaseCost", step: 0.25, min: 0 },
  { key: "swapVowelLiquidCost", label: "swapVowelLiquidCost", step: 0.25, min: 0 },
  {
    key: "swapVowelSemivowelCost",
    label: "swapVowelSemivowelCost",
    step: 0.25,
    min: 0
  },
  { key: "swapVowelNasalCost", label: "swapVowelNasalCost", step: 0.25, min: 0 },
  {
    key: "swapVowelObstruentCost",
    label: "swapVowelObstruentCost",
    step: 0.25,
    min: 0
  },
  {
    key: "swapSameBroadClassCost",
    label: "swapSameBroadClassCost",
    step: 0.25,
    min: 0
  },
  { key: "swapSpecialPenalty", label: "swapSpecialPenalty", step: 0.25, min: 0 }
];

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded border border-moss/15 bg-white p-4 shadow-sm">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setOpen((current) => !current)}
        title={open ? "Close settings" : "Open settings"}
        type="button"
      >
        <span>
          <span className="text-base font-semibold text-ink">Settings</span>
          <span className="mt-1 block text-xs text-moss">
            valid &lt;= {settings.validMax} / borderline &lt;= {settings.borderlineMax}
          </span>
        </span>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-moss/25 bg-white text-ink">
          {open ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
        </span>
      </button>

      {open ? (
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid gap-3">
            {numericSettings.map((setting) => (
              <label
                className="grid min-w-0 gap-1.5 text-sm font-semibold text-ink"
                key={setting.key}
              >
                <span className="break-words">{setting.label}</span>
                <input
                  className="h-10 w-full min-w-0 rounded border border-moss/25 bg-white px-3 text-sm"
                  min={setting.min}
                  onChange={(event) =>
                    onChange({
                      ...settings,
                      [setting.key]: Number(event.target.value)
                    })
                  }
                  step={setting.step}
                  type="number"
                  value={settings[setting.key] as number}
                />
              </label>
            ))}
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink">
            <input
              checked={settings.allowHomophoneMoves}
              className="h-4 w-4"
              onChange={(event) =>
                onChange({
                  ...settings,
                  allowHomophoneMoves: event.target.checked
                })
              }
              type="checkbox"
            />
            allowHomophoneMoves
          </label>
        </div>
      ) : null}
    </section>
  );
}
