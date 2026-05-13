import type { ChainOp } from "./diff";
import type { VisualChange } from "./visualOps";

export function chainOpToVisualChanges(op: ChainOp): VisualChange[] {
  switch (op.type) {
    case "noop":
      return [];
    case "invalid":
      return [
        {
          type: "invalid",
          from: [],
          to: [],
          description: op.reason,
          source: "spelling-preview"
        }
      ];
    case "substitution":
      return [
        {
          type: "substitution",
          from: [op.from],
          to: [op.to],
          description: `${op.from} → ${op.to}`,
          source: "spelling-preview"
        }
      ];
    case "insertion":
      return [
        {
          type: "insertion",
          from: [],
          to: [op.letter],
          description: `+${op.letter}`,
          source: "spelling-preview"
        }
      ];
    case "deletion":
      return [
        {
          type: "deletion",
          from: [op.letter],
          to: [],
          description: `−${op.letter}`,
          source: "spelling-preview"
        }
      ];
    case "swap":
      return [
        {
          type: "swap",
          from: [op.from[0], op.from[1]],
          to: [op.to[0], op.to[1]],
          description: `${op.from[0]} ⇄ ${op.from[1]}`,
          source: "spelling-preview"
        }
      ];
    case "lengthening":
      return [
        {
          type: "lengthening",
          from: [op.letter],
          to: [op.letter, op.letter],
          description: `${op.letter} → ${op.letter}${op.letter}`,
          source: "spelling-preview"
        }
      ];
    case "shortening":
      return [
        {
          type: "shortening",
          from: [op.letter, op.letter],
          to: [op.letter],
          description: `${op.letter}${op.letter} → ${op.letter}`,
          source: "spelling-preview"
        }
      ];
    case "cluster-change":
      return [
        {
          type: "cluster-change",
          from: op.from.split(""),
          to: op.to.split(""),
          description: `${op.from} → ${op.to}`,
          source: "spelling-preview"
        }
      ];
    case "onset-change":
      return [
        {
          type: "onset-change",
          from: op.from.split(""),
          to: op.to.split(""),
          description: `${op.from} → ${op.to}`,
          source: "spelling-preview"
        }
      ];
    default:
      return [];
  }
}
