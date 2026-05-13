import type { ChangeType, MoveChange, MoveValidation } from "@/lib/types";
import type { VisualChange, VisualRuleType } from "./visualOps";

const CHANGE_TYPE_PASSTHROUGH = new Set<ChangeType>([
  "substitution",
  "insertion",
  "deletion",
  "lengthening",
  "shortening",
  "cluster-change",
  "onset-change",
  "swap"
]);

function mapChangeType(type: ChangeType): VisualRuleType {
  return CHANGE_TYPE_PASSTHROUGH.has(type) ? (type as VisualRuleType) : "invalid";
}

function normalizeDisplayTokens(
  value: MoveChange["from"] | MoveChange["to"] | undefined
): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

function moveChangeToVisualChange(change: MoveChange): VisualChange {
  return {
    type: mapChangeType(change.type),
    from: normalizeDisplayTokens(change.from),
    to: normalizeDisplayTokens(change.to),
    cost: change.cost,
    description: change.description,
    source: "phonetic"
  };
}

export function moveValidationToVisualChanges(
  validation: MoveValidation
): VisualChange[] {
  if (validation.sameOrthographicWord && !validation.homophoneMove) {
    return [];
  }

  if (validation.homophoneMove) {
    return [
      {
        type: "homophone",
        from: validation.from.phonemes.map(String),
        to: validation.to.phonemes.map(String),
        cost: validation.cost,
        description: "same sound, different spelling",
        source: "phonetic"
      }
    ];
  }

  if (!validation.phoneticValid && validation.changes.length === 0) {
    return [
      {
        type: "invalid",
        from: validation.from.phonemes.map(String),
        to: validation.to.phonemes.map(String),
        cost: validation.cost,
        description: validation.explanation,
        source: "phonetic"
      }
    ];
  }

  return validation.changes.map(moveChangeToVisualChange);
}
