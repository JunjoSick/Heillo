import { describe, expect, it } from "vitest";
import { validateMove } from "@/lib/phonetics/validateMove";
import { defaultSettings } from "@/lib/settings/defaultSettings";

describe("homophones and no-ops", () => {
  it("blocks pure no-ops", () => {
    const same = validateMove("gioco", "gioco", defaultSettings);

    expect(same.zeroDistance).toBe(true);
    expect(same.sameOrthographicWord).toBe(true);
    expect(same.homophoneMove).toBe(false);
    expect(same.acceptAsProgress).toBe(false);
  });

  it("accepts homophones by default", () => {
    const ho = validateMove("ho", "o", defaultSettings);
    expect(ho.zeroDistance).toBe(true);
    expect(ho.sameOrthographicWord).toBe(false);
    expect(ho.homophoneMove).toBe(true);
    expect(ho.acceptAsProgress).toBe(true);

    const hannoAnno = validateMove("hanno", "anno", defaultSettings);
    expect(hannoAnno.zeroDistance).toBe(true);
    expect(hannoAnno.homophoneMove).toBe(true);

    const pero = validateMove("però", "pero", defaultSettings);
    expect(pero.zeroDistance).toBe(true);
    expect(pero.sameOrthographicWord).toBe(false);
    expect(pero.homophoneMove).toBe(true);
    expect(pero.acceptAsProgress).toBe(true);
  });
});
