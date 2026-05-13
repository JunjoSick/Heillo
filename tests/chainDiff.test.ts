import { describe, expect, it } from "vitest";
import {
  classifyChain,
  toIndicesAffected,
  type ChainOp
} from "@/components/chain/diff";

describe("classifyChain", () => {
  it("returns noop for identical words", () => {
    expect(classifyChain("palme", "palme")).toEqual({ type: "noop" });
  });

  it("returns invalid for empty input", () => {
    expect(classifyChain("", "anything")).toMatchObject({ type: "invalid" });
    expect(classifyChain("anything", "")).toMatchObject({ type: "invalid" });
  });

  it("detects single-letter substitution", () => {
    expect(classifyChain("plame", "plate")).toEqual({
      type: "substitution",
      at: 3,
      from: "m",
      to: "t"
    });
  });

  it("detects adjacent swap", () => {
    expect(classifyChain("palme", "plame")).toEqual({
      type: "swap",
      i: 1,
      j: 2,
      from: ["a", "l"],
      to: ["l", "a"]
    });
  });

  it("detects single insertion", () => {
    expect(classifyChain("plate", "plates")).toEqual({
      type: "insertion",
      at: 5,
      letter: "s"
    });
  });

  it("detects single deletion", () => {
    expect(classifyChain("plates", "plate")).toEqual({
      type: "deletion",
      at: 5,
      letter: "s"
    });
  });

  it("classifies an inserted letter next to its twin as lengthening", () => {
    expect(classifyChain("plates", "plattes")).toEqual({
      type: "lengthening",
      at: 3,
      letter: "t"
    });
  });

  it("classifies a deletion that collapses a double as shortening", () => {
    expect(classifyChain("plattes", "plates")).toEqual({
      type: "shortening",
      at: 3,
      letter: "t"
    });
  });

  it("classifies multi-char interior change as cluster-change", () => {
    const op = classifyChain("plate", "glave");
    expect(op.type).toBe("cluster-change");
    if (op.type === "cluster-change") {
      expect(op.from).toBe("plat");
      expect(op.to).toBe("glav");
    }
  });

  it("classifies a multi-char leading change as onset-change", () => {
    const op = classifyChain("glave", "snave");
    expect(op.type).toBe("onset-change");
    if (op.type === "onset-change") {
      expect(op.p).toBe(0);
      expect(op.from).toBe("gl");
      expect(op.to).toBe("sn");
    }
  });

  it("walks the design SAMPLE_PATH and yields every rule type in order", () => {
    const path = [
      "palme",
      "plame",
      "plate",
      "plates",
      "plattes",
      "plates",
      "plate",
      "glave",
      "snave"
    ];
    const expectedTypes: ChainOp["type"][] = [
      "swap",
      "substitution",
      "insertion",
      "lengthening",
      "shortening",
      "deletion",
      "cluster-change",
      "onset-change"
    ];
    const actual = [];
    for (let i = 1; i < path.length; i++) {
      actual.push(classifyChain(path[i - 1], path[i]).type);
    }
    expect(actual).toEqual(expectedTypes);
  });
});

describe("toIndicesAffected", () => {
  it("highlights the substituted position", () => {
    const op = classifyChain("plame", "plate");
    expect(toIndicesAffected(op, 5)).toEqual([3]);
  });

  it("highlights both swap positions", () => {
    const op = classifyChain("palme", "plame");
    expect(toIndicesAffected(op, 5)).toEqual([1, 2]);
  });

  it("highlights the inserted index on the new word", () => {
    const op = classifyChain("plate", "plates");
    expect(toIndicesAffected(op, 6)).toEqual([5]);
  });

  it("highlights nothing on the source side for deletion", () => {
    const op = classifyChain("plates", "plate");
    expect(toIndicesAffected(op, 5)).toEqual([]);
  });

  it("highlights the full target range for cluster-change", () => {
    const op = classifyChain("plate", "glave");
    expect(toIndicesAffected(op, 5)).toEqual([0, 1, 2, 3]);
  });

  it("highlights the full target range for onset-change", () => {
    const op = classifyChain("glave", "snave");
    expect(toIndicesAffected(op, 5)).toEqual([0, 1]);
  });
});
