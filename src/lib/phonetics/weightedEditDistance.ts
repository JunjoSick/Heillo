import type {
  AlignmentStep,
  GameSettings,
  MoveChange,
  PhonemeToken
} from "@/lib/types";
import {
  CLUSTER_TRANSITIONS,
  describeClusterChange
} from "@/lib/phonetics/clusterRespelling";
import {
  COMPLEX_ONSET_TRANSITIONS,
  describeComplexOnsetChange
} from "@/lib/phonetics/complexOnsetTransitions";
import {
  getDeletionCost,
  getInsertionCost
} from "@/lib/phonetics/insertionDeletionCosts";
import { getLengthFeature } from "@/lib/phonetics/geminates";
import { getSubstitutionCost } from "@/lib/phonetics/substitutionCost";
import { getSwapCost } from "@/lib/phonetics/swapCosts";

export interface WeightedEditDistanceResult {
  cost: number;
  changes: MoveChange[];
  alignment: AlignmentStep[] | null;
}

interface Cell {
  cost: number;
  changes: MoveChange[];
  alignment: AlignmentStep[];
}

function emptyCell(): Cell {
  return {
    cost: Infinity,
    changes: [],
    alignment: []
  };
}

function slicesMatch(
  tokens: PhonemeToken[],
  index: number,
  expected: PhonemeToken[]
): boolean {
  return expected.every((token, offset) => tokens[index + offset] === token);
}

function describeSubstitution(
  from: PhonemeToken,
  to: PhonemeToken,
  cost: number
): MoveChange {
  const fromLength = getLengthFeature(from);
  const toLength = getLengthFeature(to);
  let type: MoveChange["type"] = "substitution";

  if (fromLength && toLength && fromLength.base === toLength.base) {
    type = fromLength.long ? "shortening" : "lengthening";
  }

  return {
    type,
    from,
    to,
    cost,
    description: `${from} -> ${to}`
  };
}

function describeInsertion(token: PhonemeToken, cost: number): MoveChange {
  return {
    type: "insertion",
    to: token,
    cost,
    description: `insert ${token}`
  };
}

function describeDeletion(token: PhonemeToken, cost: number): MoveChange {
  return {
    type: "deletion",
    from: token,
    cost,
    description: `delete ${token}`
  };
}

function describeSwap(
  fromPair: [PhonemeToken, PhonemeToken],
  toPair: [PhonemeToken, PhonemeToken],
  cost: number
): MoveChange {
  return {
    type: "swap",
    from: fromPair,
    to: toPair,
    cost,
    description: `swap ${fromPair.join(" ")} -> ${toPair.join(" ")}`
  };
}

function preferCandidate(current: Cell, candidate: Cell): boolean {
  if (candidate.cost < current.cost) {
    return true;
  }

  if (candidate.cost > current.cost) {
    return false;
  }

  return candidate.changes.length < current.changes.length;
}

function addTransition(
  grid: Cell[][],
  i: number,
  j: number,
  nextI: number,
  nextJ: number,
  base: Cell,
  step: AlignmentStep,
  change: MoveChange | null,
  maxCost: number | undefined
): void {
  const cost = base.cost + step.cost;

  if (maxCost !== undefined && cost > maxCost) {
    return;
  }

  const candidate: Cell = {
    cost,
    changes: change && change.cost > 0 ? [...base.changes, change] : base.changes,
    alignment: [...base.alignment, step]
  };

  if (preferCandidate(grid[nextI][nextJ], candidate)) {
    grid[nextI][nextJ] = candidate;
  }
}

export function weightedEditDistance(
  from: PhonemeToken[],
  to: PhonemeToken[],
  settings: GameSettings,
  options: { maxCost?: number } = {}
): WeightedEditDistanceResult {
  const grid: Cell[][] = Array.from({ length: from.length + 1 }, () =>
    Array.from({ length: to.length + 1 }, emptyCell)
  );
  const maxCost = options.maxCost;
  grid[0][0] = { cost: 0, changes: [], alignment: [] };

  for (let i = 0; i <= from.length; i += 1) {
    for (let j = 0; j <= to.length; j += 1) {
      const cell = grid[i][j];

      if (!Number.isFinite(cell.cost)) {
        continue;
      }

      if (maxCost !== undefined && cell.cost > maxCost) {
        continue;
      }

      if (i < from.length && j < to.length) {
        const cost = getSubstitutionCost(from[i], to[j], settings);
        addTransition(
          grid,
          i,
          j,
          i + 1,
          j + 1,
          cell,
          {
            from: [from[i]],
            to: [to[j]],
            cost,
            type: cost === 0 ? "match" : "substitution"
          },
          cost === 0 ? null : describeSubstitution(from[i], to[j], cost),
          maxCost
        );
      }

      if (i < from.length) {
        const cost = getDeletionCost(from[i], settings);
        addTransition(
          grid,
          i,
          j,
          i + 1,
          j,
          cell,
          { from: [from[i]], to: [], cost, type: "deletion" },
          describeDeletion(from[i], cost),
          maxCost
        );
      }

      if (j < to.length) {
        const cost = getInsertionCost(to[j], settings);
        addTransition(
          grid,
          i,
          j,
          i,
          j + 1,
          cell,
          { from: [], to: [to[j]], cost, type: "insertion" },
          describeInsertion(to[j], cost),
          maxCost
        );
      }

      for (const transition of CLUSTER_TRANSITIONS) {
        if (
          slicesMatch(from, i, transition.from) &&
          slicesMatch(to, j, transition.to)
        ) {
          addTransition(
            grid,
            i,
            j,
            i + transition.from.length,
            j + transition.to.length,
            cell,
            {
              from: transition.from,
              to: transition.to,
              cost: transition.cost,
              type: "cluster-change"
            },
            describeClusterChange(transition.from, transition.to, transition.cost),
            maxCost
          );
        }
      }

      for (const transition of COMPLEX_ONSET_TRANSITIONS) {
        if (
          slicesMatch(from, i, transition.from) &&
          slicesMatch(to, j, transition.to)
        ) {
          addTransition(
            grid,
            i,
            j,
            i + transition.from.length,
            j + transition.to.length,
            cell,
            {
              from: transition.from,
              to: transition.to,
              cost: transition.cost,
              type: "onset-change"
            },
            describeComplexOnsetChange(transition.from, transition.to, transition.cost),
            maxCost
          );
        }

        if (
          slicesMatch(from, i, transition.to) &&
          slicesMatch(to, j, transition.from)
        ) {
          addTransition(
            grid,
            i,
            j,
            i + transition.to.length,
            j + transition.from.length,
            cell,
            {
              from: transition.to,
              to: transition.from,
              cost: transition.cost,
              type: "onset-change"
            },
            describeComplexOnsetChange(transition.to, transition.from, transition.cost),
            maxCost
          );
        }
      }

      if (
        i + 1 < from.length &&
        j + 1 < to.length &&
        from[i] === to[j + 1] &&
        from[i + 1] === to[j]
      ) {
        const cost = getSwapCost(from[i], from[i + 1], settings);

        if (cost !== null) {
          const fromPair: [PhonemeToken, PhonemeToken] = [from[i], from[i + 1]];
          const toPair: [PhonemeToken, PhonemeToken] = [to[j], to[j + 1]];

          addTransition(
            grid,
            i,
            j,
            i + 2,
            j + 2,
            cell,
            {
              from: fromPair,
              to: toPair,
              cost,
              type: "swap"
            },
            describeSwap(fromPair, toPair, cost),
            maxCost
          );
        }
      }
    }
  }

  const result = grid[from.length][to.length];

  if (!Number.isFinite(result.cost)) {
    return {
      cost: Infinity,
      changes: [],
      alignment: null
    };
  }

  return result;
}
