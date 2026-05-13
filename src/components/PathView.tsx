import { PathTimeline } from "@/components/PathTimeline";
import type { PathEntry } from "@/lib/types";

interface PathViewProps {
  path: PathEntry[];
  maxCompoundStreak: number;
  onReset: () => void;
}

export function PathView(props: PathViewProps) {
  return <PathTimeline {...props} />;
}
