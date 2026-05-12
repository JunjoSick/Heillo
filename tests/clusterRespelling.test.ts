import { describe, expect, it } from "vitest";
import { getClusterRespellingCost } from "@/lib/phonetics/clusterRespelling";
import { defaultSettings } from "@/lib/settings/defaultSettings";

describe("cluster respelling", () => {
  it("supports known symmetric cluster respellings", () => {
    expect(getClusterRespellingCost(["SC"], ["S", "K"], defaultSettings)).toBe(2.5);
    expect(getClusterRespellingCost(["S", "K"], ["SC"], defaultSettings)).toBe(2.5);
  });

  it("returns null for unknown cluster fallbacks", () => {
    expect(getClusterRespellingCost(["SS"], ["S", "K"], defaultSettings)).toBeNull();
  });
});
