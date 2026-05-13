import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CircleDot,
  GitBranch,
  Minus,
  Plus,
  Shuffle
} from "lucide-react";
import type { ChangeType, MoveChange } from "@/lib/types";

type BadgeType = ChangeType | "homophone" | "match";

interface RuleBadgeProps {
  change?: MoveChange;
  type?: BadgeType;
}

const badgeConfig: Record<
  BadgeType,
  {
    label: string;
    className: string;
    Icon: LucideIcon;
  }
> = {
  substitution: {
    label: "change",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
    Icon: ArrowRight
  },
  insertion: {
    label: "+ add",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Icon: Plus
  },
  deletion: {
    label: "- drop",
    className: "border-red-200 bg-red-50 text-red-700",
    Icon: Minus
  },
  lengthening: {
    label: "long",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    Icon: ArrowRight
  },
  shortening: {
    label: "short",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
    Icon: ArrowRight
  },
  "cluster-change": {
    label: "split",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    Icon: GitBranch
  },
  "onset-change": {
    label: "onset",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
    Icon: GitBranch
  },
  swap: {
    label: "swap",
    className: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
    Icon: Shuffle
  },
  homophone: {
    label: "same sound",
    className: "border-zinc-300 bg-white text-zinc-700",
    Icon: CircleDot
  },
  match: {
    label: "match",
    className: "border-moss/15 bg-mist text-moss",
    Icon: CircleDot
  }
};

export function RuleBadge({ change, type }: RuleBadgeProps) {
  const badgeType = change?.type ?? type ?? "match";
  const config = badgeConfig[badgeType];
  const Icon = config.Icon;

  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold ${config.className}`}
      title={change?.description ?? config.label}
    >
      <Icon aria-hidden size={13} strokeWidth={2.4} />
      {config.label}
    </span>
  );
}
