import type {
  GameSettings,
  MoveValidation,
  PathAcceptance,
  PathEntry
} from "@/lib/types";

export function getCompoundStreak(moves: MoveValidation[]): number {
  let streak = 0;

  for (let index = moves.length - 1; index >= 0; index -= 1) {
    if (!moves[index].isCompound) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export function lastNMovesAreCompound(
  moves: MoveValidation[],
  count: number
): boolean {
  if (count <= 0) {
    return true;
  }

  if (moves.length < count) {
    return false;
  }

  return moves.slice(-count).every((move) => move.isCompound);
}

export function canAcceptMove(
  acceptedMoves: MoveValidation[],
  move: MoveValidation,
  settings: GameSettings
): PathAcceptance {
  if (move.class === "invalid" || !move.phoneticValid) {
    return {
      accepted: false,
      reason: "invalid-move",
      message: "Invalid moves cannot be added to the path."
    };
  }

  if (!move.acceptAsProgress) {
    return {
      accepted: false,
      reason: "not-progress",
      message: "This move does not count as path progress."
    };
  }

  if (
    move.isCompound &&
    lastNMovesAreCompound(acceptedMoves, settings.maxCompoundStreak)
  ) {
    return {
      accepted: false,
      reason: "compound-streak-exceeded",
      message: `Compound streak: ${settings.maxCompoundStreak}/${settings.maxCompoundStreak}.`
    };
  }

  return {
    accepted: true,
    reason: "accepted",
    message: "Move accepted."
  };
}

export function appendMove(path: PathEntry[], move: MoveValidation): PathEntry[] {
  return [
    ...path,
    {
      word: move.to,
      move
    }
  ];
}

export function resetPath(): PathEntry[] {
  return [];
}
