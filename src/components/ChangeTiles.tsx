import {
  ArrowRight,
  GitBranch,
  Minus,
  Plus,
  Shuffle
} from "lucide-react";
import type { ReactNode } from "react";
import type { MoveChange, PhonemeToken } from "@/lib/types";

interface ChangeTilesProps {
  change: MoveChange;
  compact?: boolean;
}

const toneClass = {
  substitution: "border-indigo-200 bg-indigo-50 text-indigo-800",
  insertion: "border-emerald-200 bg-emerald-50 text-emerald-800",
  deletion: "border-red-200 bg-red-50 text-red-800",
  lengthening: "border-amber-200 bg-amber-50 text-amber-800",
  shortening: "border-yellow-200 bg-yellow-50 text-yellow-800",
  "cluster-change": "border-orange-200 bg-orange-50 text-orange-800",
  "onset-change": "border-cyan-200 bg-cyan-50 text-cyan-800",
  swap: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800"
};

export function ChangeTiles({ change, compact = false }: ChangeTilesProps) {
  const from = toTokens(change.from);
  const to = toTokens(change.to);
  const iconSize = compact ? 14 : 16;

  if (change.type === "insertion") {
    return (
      <ChangeFrame change={change} compact={compact}>
        <Plus aria-hidden className="text-emerald-600" size={iconSize} />
        <TokenRow tokens={to} tone="insertion" />
      </ChangeFrame>
    );
  }

  if (change.type === "deletion") {
    return (
      <ChangeFrame change={change} compact={compact}>
        <Minus aria-hidden className="text-red-600" size={iconSize} />
        <TokenRow ghost tokens={from} tone="deletion" />
      </ChangeFrame>
    );
  }

  if (change.type === "swap") {
    return (
      <ChangeFrame change={change} compact={compact}>
        <div className="grid gap-1">
          <TokenRow tokens={from} tone="swap" />
          <div className="flex justify-center">
            <Shuffle aria-hidden className="text-fuchsia-600" size={iconSize} />
          </div>
          <TokenRow tokens={to} tone="swap" />
        </div>
      </ChangeFrame>
    );
  }

  if (change.type === "cluster-change" || change.type === "onset-change") {
    return (
      <ChangeFrame change={change} compact={compact}>
        <TokenRow tokens={from} tone={change.type} />
        <GitBranch
          aria-hidden
          className={
            change.type === "onset-change" ? "text-cyan-600" : "text-orange-600"
          }
          size={iconSize}
        />
        <TokenRow tokens={to} tone={change.type} />
      </ChangeFrame>
    );
  }

  return (
    <ChangeFrame change={change} compact={compact}>
      <TokenRow tokens={from} tone={change.type} />
      <ArrowRight aria-hidden className="text-moss" size={iconSize} />
      <TokenRow tokens={to} tone={change.type} />
    </ChangeFrame>
  );
}

function ChangeFrame({
  change,
  compact,
  children
}: {
  change: MoveChange;
  compact: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border bg-white ${
        compact ? "px-2 py-1" : "px-3 py-2"
      } ${toneClass[change.type]}`}
      title={`${change.description}, cost ${change.cost}`}
    >
      {children}
    </div>
  );
}

function TokenRow({
  tokens,
  tone,
  ghost = false
}: {
  tokens: PhonemeToken[];
  tone: MoveChange["type"];
  ghost?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {tokens.map((token, index) => (
        <span
          className={`inline-flex h-7 min-w-7 items-center justify-center rounded border px-2 text-xs font-bold ${
            toneClass[tone]
          } ${ghost ? "opacity-50 line-through" : ""}`}
          key={`${token}-${index}`}
        >
          {token}
        </span>
      ))}
    </span>
  );
}

function toTokens(value: MoveChange["from"]): PhonemeToken[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}
