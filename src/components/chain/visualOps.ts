import type { MoveValidation } from "@/lib/types";
import type { ChainOp } from "./diff";

export type VisualRuleType =
  | "substitution"
  | "insertion"
  | "deletion"
  | "swap"
  | "lengthening"
  | "shortening"
  | "cluster-change"
  | "onset-change"
  | "homophone"
  | "invalid"
  | "noop";

export type VisualChangeSource = "phonetic" | "spelling-preview";

export interface VisualChange {
  type: VisualRuleType;
  from: string[];
  to: string[];
  cost?: number;
  description: string;
  source: VisualChangeSource;
}

export type VisualOpSource =
  | { kind: "start" }
  | { kind: "tentative-spelling-preview"; op: ChainOp }
  | { kind: "validated-phonetic"; validation: MoveValidation };
