import { describe, expect, it } from "vitest";
import {
  getMaxLengthDelta,
  suggestNextWords
} from "@/lib/phonetics/suggestNextWords";
import { defaultSettings } from "@/lib/settings/defaultSettings";

describe("suggestNextWords", () => {
  it("uses the dynamic length filter", () => {
    expect(getMaxLengthDelta(defaultSettings)).toBe(2);
  });

  it("sorts by class, cost, changes, and length", () => {
    const dictionary = ["schema", "geco", "pane", "palla", "schiena"];
    const suggestions = suggestNextWords("gioco", dictionary, defaultSettings, {
      dictionaryWords: dictionary
    });

    expect(suggestions[0].word).toBe("geco");
    expect(suggestions[0].validation.class).toBe("smooth");
    expect(suggestions.every((suggestion) => suggestion.validation.class !== "invalid")).toBe(
      true
    );
  });

  it("finds roadmap suggestions when present", () => {
    const dictionary = ["geco", "palla", "schema"];

    expect(suggestNextWords("gioco", dictionary, defaultSettings).map((s) => s.word)).toContain(
      "geco"
    );
    expect(suggestNextWords("pala", dictionary, defaultSettings).map((s) => s.word)).toContain(
      "palla"
    );
    expect(suggestNextWords("scena", dictionary, defaultSettings).map((s) => s.word)).toContain(
      "schema"
    );
  });
});
