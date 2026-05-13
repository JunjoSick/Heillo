import { describe, expect, it } from "vitest";
import { getSwapCost } from "@/lib/phonetics/swapCosts";
import { defaultSettings } from "@/lib/settings/defaultSettings";

describe("getSwapCost", () => {
  it("scores recommended swap categories", () => {
    expect(getSwapCost("A", "R", defaultSettings)).toBe(1.25);
    expect(getSwapCost("R", "A", defaultSettings)).toBe(1.25);

    expect(getSwapCost("A", "J", defaultSettings)).toBe(1.25);
    expect(getSwapCost("A", "N", defaultSettings)).toBe(1.5);
    expect(getSwapCost("A", "T", defaultSettings)).toBe(2.0);

    expect(getSwapCost("L", "R", defaultSettings)).toBe(1.5);
    expect(getSwapCost("GN", "A", defaultSettings)).toBe(2.0);
    expect(getSwapCost("A", "A", defaultSettings)).toBeNull();
  });
});
