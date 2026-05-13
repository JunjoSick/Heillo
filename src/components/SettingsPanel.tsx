"use client";

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
  return (
    <section className="rounded border border-moss/15 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-ink">Settings</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {numericSettings.map((setting) => (
          <label className="grid gap-1.5 text-sm font-semibold text-ink" key={setting.key}>
            {setting.label}
            <input
              className="h-10 rounded border border-moss/25 bg-white px-3 text-sm"
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
    </section>
  );
}
