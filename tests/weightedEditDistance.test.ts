import { describe, expect, it } from "vitest";
import { weightedEditDistance } from "@/lib/phonetics/weightedEditDistance";
import { defaultSettings } from "@/lib/settings/defaultSettings";

describe("weightedEditDistance", () => {
  it("scores canonical smooth and geminate moves", () => {
    expect(
      weightedEditDistance(["GD", "O", "K", "O"], ["GD", "E", "K", "O"], defaultSettings).cost
    ).toBe(1);
    expect(
      weightedEditDistance(["P", "A", "L", "A"], ["P", "A", "LL", "A"], defaultSettings).cost
    ).toBe(1);
  });

  it("uses atomic cluster changes", () => {
    const result = weightedEditDistance(
      ["SC", "E", "N", "A"],
      ["S", "K", "E", "M", "A"],
      defaultSettings
    );

    expect(result.cost).toBe(3.5);
    expect(result.changes.some((change) => change.type === "cluster-change")).toBe(true);
  });

  it("uses atomic complex onset changes", () => {
    const result = weightedEditDistance(
      ["GD", "O", "K", "O"],
      ["F", "J", "O", "K", "O"],
      defaultSettings
    );

    expect(result.cost).toBe(2.0);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].type).toBe("onset-change");
    expect(result.changes[0].from).toEqual(["GD"]);
    expect(result.changes[0].to).toEqual(["F", "J"]);
  });

  it("uses atomic adjacent phonetic swaps", () => {
    const result = weightedEditDistance(
      ["T", "A", "R", "M", "A"],
      ["T", "R", "A", "M", "A"],
      defaultSettings
    );

    expect(result.cost).toBe(1.25);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].type).toBe("swap");
    expect(result.changes[0].description).toBe("swap A R -> R A");
  });

  it("keeps base and length changes atomic", () => {
    const result = weightedEditDistance(["L"], ["RR"], defaultSettings);

    expect(result.cost).toBe(2);
    expect(result.changes).toHaveLength(1);
  });

  it("supports bounded pruning", () => {
    const result = weightedEditDistance(
      ["SC", "E", "N", "A"],
      ["S", "K", "J", "E", "N", "A"],
      defaultSettings,
      { maxCost: 3.5 }
    );

    expect(result.cost).toBe(Infinity);
    expect(result.alignment).toBeNull();
  });
});
