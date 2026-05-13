import { describe, expect, it } from "vitest";
import dictionary from "../public/dictionary.json";
import { validateMove } from "@/lib/phonetics/validateMove";
import { defaultSettings } from "@/lib/settings/defaultSettings";

describe("dictionary self moves", () => {
  it("treats every dictionary word as a blocked no-op against itself", () => {
    for (const word of dictionary as string[]) {
      const result = validateMove(word, word, defaultSettings);

      expect(result.cost).toBe(0);
      expect(result.zeroDistance).toBe(true);
      expect(result.sameOrthographicWord).toBe(true);
      expect(result.acceptAsProgress).toBe(false);
    }
  });
});
