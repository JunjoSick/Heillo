export type ChainRule =
  | "substitution"
  | "insertion"
  | "deletion"
  | "swap"
  | "lengthening"
  | "shortening"
  | "cluster-change"
  | "onset-change";

export type ChainOp =
  | { type: "noop" }
  | { type: "invalid"; reason: string }
  | { type: "substitution"; at: number; from: string; to: string }
  | { type: "swap"; i: number; j: number; from: [string, string]; to: [string, string] }
  | { type: "insertion"; at: number; letter: string }
  | { type: "deletion"; at: number; letter: string }
  | { type: "lengthening"; at: number; letter: string }
  | { type: "shortening"; at: number; letter: string }
  | { type: "cluster-change"; p: number; aEnd: number; bEnd: number; from: string; to: string }
  | { type: "onset-change"; p: number; aEnd: number; bEnd: number; from: string; to: string };

function norm(w: string): string {
  return String(w || "").toLowerCase().trim();
}

function detectSwap(a: string, b: string) {
  const diffs: number[] = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffs.push(i);
    if (diffs.length > 2) return null;
  }
  if (
    diffs.length === 2 &&
    diffs[1] === diffs[0] + 1 &&
    a[diffs[0]] === b[diffs[1]] &&
    a[diffs[1]] === b[diffs[0]]
  ) {
    return {
      type: "swap" as const,
      i: diffs[0],
      j: diffs[1],
      from: [a[diffs[0]], a[diffs[1]]] as [string, string],
      to: [b[diffs[0]], b[diffs[1]]] as [string, string]
    };
  }
  return null;
}

function detectInsertion(a: string, b: string): ChainOp | null {
  for (let i = 0; i <= a.length; i++) {
    const candidate = a.slice(0, i) + b[i] + a.slice(i);
    if (candidate === b) {
      const letter = b[i];
      const left = i > 0 ? a[i - 1] : null;
      const right = i < a.length ? a[i] : null;
      if (letter === left || letter === right) {
        return { type: "lengthening", at: i, letter };
      }
      return { type: "insertion", at: i, letter };
    }
  }
  return null;
}

function detectDeletion(a: string, b: string): ChainOp | null {
  for (let i = 0; i < a.length; i++) {
    const candidate = a.slice(0, i) + a.slice(i + 1);
    if (candidate === b) {
      const letter = a[i];
      const left = i > 0 ? a[i - 1] : null;
      const right = i < a.length - 1 ? a[i + 1] : null;
      if (letter === left || letter === right) {
        return { type: "shortening", at: i, letter };
      }
      return { type: "deletion", at: i, letter };
    }
  }
  return null;
}

function clusterChangeRange(a: string, b: string) {
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let sa = a.length;
  let sb = b.length;
  while (sa > p && sb > p && a[sa - 1] === b[sb - 1]) {
    sa--;
    sb--;
  }
  return { p, aEnd: sa, bEnd: sb, fromSeg: a.slice(p, sa), toSeg: b.slice(p, sb) };
}

function isOnsetRange(a: string, b: string): boolean {
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let sa = a.length;
  let sb = b.length;
  while (sa > p && sb > p && a[sa - 1] === b[sb - 1]) {
    sa--;
    sb--;
  }
  const trailing = a.length - sa;
  return p === 0 && sa <= 3 && sb <= 3 && trailing >= 2;
}

export function classifyChain(fromRaw: string, toRaw: string): ChainOp {
  const a = norm(fromRaw);
  const b = norm(toRaw);
  if (!a || !b) return { type: "invalid", reason: "missing word" };
  if (a === b) return { type: "noop" };

  if (a.length === b.length) {
    const swap = detectSwap(a, b);
    if (swap) return swap;
    const diffs: number[] = [];
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diffs.push(i);
    if (diffs.length === 1) {
      return { type: "substitution", at: diffs[0], from: a[diffs[0]], to: b[diffs[0]] };
    }
    const r = clusterChangeRange(a, b);
    if (isOnsetRange(a, b)) {
      return {
        type: "onset-change",
        p: r.p,
        aEnd: r.aEnd,
        bEnd: r.bEnd,
        from: r.fromSeg,
        to: r.toSeg
      };
    }
    return {
      type: "cluster-change",
      p: r.p,
      aEnd: r.aEnd,
      bEnd: r.bEnd,
      from: r.fromSeg,
      to: r.toSeg
    };
  }

  if (b.length === a.length + 1) {
    const ins = detectInsertion(a, b);
    if (ins) return ins;
  }
  if (b.length === a.length - 1) {
    const del = detectDeletion(a, b);
    if (del) return del;
  }

  const r = clusterChangeRange(a, b);
  if (isOnsetRange(a, b)) {
    return {
      type: "onset-change",
      p: r.p,
      aEnd: r.aEnd,
      bEnd: r.bEnd,
      from: r.fromSeg,
      to: r.toSeg
    };
  }
  return {
    type: "cluster-change",
    p: r.p,
    aEnd: r.aEnd,
    bEnd: r.bEnd,
    from: r.fromSeg,
    to: r.toSeg
  };
}

export function toIndicesAffected(op: ChainOp, _toLen: number): number[] {
  switch (op.type) {
    case "substitution":
      return [op.at];
    case "swap":
      return [op.i, op.j];
    case "deletion":
    case "shortening":
      return [];
    case "insertion":
    case "lengthening":
      return [op.at];
    case "cluster-change":
    case "onset-change": {
      const out: number[] = [];
      for (let i = op.p; i < op.bEnd; i++) out.push(i);
      return out;
    }
    default:
      return [];
  }
}

export const RULE_LABELS: Record<ChainRule, string> = {
  substitution: "sub",
  insertion: "add",
  deletion: "drop",
  swap: "swap",
  lengthening: "lengthen",
  shortening: "shorten",
  "cluster-change": "cluster",
  "onset-change": "onset"
};

export const RULE_TINTS: Record<ChainRule, { c: string; bg: string }> = {
  substitution: { c: "var(--sub)", bg: "var(--sub-bg)" },
  insertion: { c: "var(--ins)", bg: "var(--ins-bg)" },
  deletion: { c: "var(--del)", bg: "var(--del-bg)" },
  swap: { c: "var(--swp)", bg: "var(--swp-bg)" },
  lengthening: { c: "var(--len)", bg: "var(--len-bg)" },
  shortening: { c: "var(--shr)", bg: "var(--shr-bg)" },
  "cluster-change": { c: "var(--clu)", bg: "var(--clu-bg)" },
  "onset-change": { c: "var(--ons)", bg: "var(--ons-bg)" }
};

export function ruleTint(type: ChainRule | null | undefined) {
  if (!type) return { c: "var(--ink)", bg: "#fff" };
  return RULE_TINTS[type] ?? { c: "var(--ink)", bg: "#fff" };
}
