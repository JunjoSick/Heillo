import type {
  AlignmentStep,
  ChangeType,
  MoveChange,
  MoveValidation
} from "@/lib/types";
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

function indicesFrom(start: number, length: number): number[] {
  return Array.from({ length }, (_, offset) => start + offset);
}

function annotateWithAlignment(
  visualChanges: VisualChange[],
  alignment: AlignmentStep[] | null
): VisualChange[] {
  if (!alignment || visualChanges.length === 0) return visualChanges;

  let fromCursor = 0;
  let toCursor = 0;
  let changeIndex = 0;
  const annotated = [...visualChanges];

  for (const step of alignment) {
    const fromStart = fromCursor;
    const toStart = toCursor;

    fromCursor += step.from.length;
    toCursor += step.to.length;

    if (step.type === "match" || step.cost <= 0) continue;

    const change = annotated[changeIndex];
    if (!change) break;

    annotated[changeIndex] = {
      ...change,
      fromIndices: indicesFrom(fromStart, step.from.length),
      toIndices: indicesFrom(toStart, step.to.length)
    };
    changeIndex += 1;
  }

  return annotated;
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

  return annotateWithAlignment(
    validation.changes.map(moveChangeToVisualChange),
    validation.alignment
  );
}
