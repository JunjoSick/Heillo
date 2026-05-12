import type { GameSettings, MoveChange, PhonemeToken } from "@/lib/types";

interface ClusterRespelling {
  from: PhonemeToken[];
  to: PhonemeToken[];
  cost: number;
}

const CLUSTER_RESPELLINGS: ClusterRespelling[] = [
  { from: ["SC"], to: ["S", "K"], cost: 2.5 },
  { from: ["GL"], to: ["G", "L"], cost: 2.5 },
  { from: ["GN"], to: ["G", "N"], cost: 2.5 },
  { from: ["CD"], to: ["T", "SC"], cost: 2.5 },
  { from: ["GD"], to: ["D", "SC"], cost: 2.5 }
];

export const CLUSTER_TRANSITIONS: ClusterRespelling[] = CLUSTER_RESPELLINGS.flatMap(
  (entry) => [entry, { from: entry.to, to: entry.from, cost: entry.cost }]
);

function sameSlice(a: PhonemeToken[], b: PhonemeToken[]): boolean {
  return a.length === b.length && a.every((token, index) => token === b[index]);
}

export function getClusterRespellingCost(
  fromSlice: PhonemeToken[],
  toSlice: PhonemeToken[],
  _settings: GameSettings
): number | null {
  const match = CLUSTER_TRANSITIONS.find(
    (entry) => sameSlice(entry.from, fromSlice) && sameSlice(entry.to, toSlice)
  );

  return match?.cost ?? null;
}

export function describeClusterChange(
  from: PhonemeToken[],
  to: PhonemeToken[],
  cost: number
): MoveChange {
  return {
    type: "cluster-change",
    from,
    to,
    cost,
    description: `${from.join(" ")} -> ${to.join(" ")}`
  };
}
