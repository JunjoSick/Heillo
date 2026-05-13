import type { MoveChange, PhonemeToken } from "@/lib/types";

export interface ComplexOnsetTransition {
  from: PhonemeToken[];
  to: PhonemeToken[];
  cost: number;
}

export const COMPLEX_ONSET_TRANSITIONS: ComplexOnsetTransition[] = [
  { from: ["GD"], to: ["F", "J"], cost: 2.0 },
  { from: ["GD"], to: ["V", "J"], cost: 2.25 },
  { from: ["CD"], to: ["F", "J"], cost: 2.25 },
  { from: ["CD"], to: ["S", "J"], cost: 2.25 },
  { from: ["SC"], to: ["S", "J"], cost: 2.25 }
];

export function getComplexOnsetTransitionCost(
  fromSlice: PhonemeToken[],
  toSlice: PhonemeToken[]
): number | null {
  for (const transition of COMPLEX_ONSET_TRANSITIONS) {
    if (
      sameSlice(fromSlice, transition.from) &&
      sameSlice(toSlice, transition.to)
    ) {
      return transition.cost;
    }

    if (
      sameSlice(fromSlice, transition.to) &&
      sameSlice(toSlice, transition.from)
    ) {
      return transition.cost;
    }
  }

  return null;
}

export function describeComplexOnsetChange(
  from: PhonemeToken[],
  to: PhonemeToken[],
  cost: number
): MoveChange {
  return {
    type: "onset-change",
    from,
    to,
    cost,
    description: `onset change ${from.join(" ")} -> ${to.join(" ")}`
  };
}

function sameSlice(a: PhonemeToken[], b: PhonemeToken[]): boolean {
  return a.length === b.length && a.every((token, index) => token === b[index]);
}
