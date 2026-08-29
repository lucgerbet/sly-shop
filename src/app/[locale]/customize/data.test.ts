import { describe, it, expect } from "vitest";
import { buildSteps, JACKET_CUT_TO_TROUSER_CUT } from "./data";

describe("buildSteps", () => {
  it("gives the standalone trousers flow only trouser-related steps", () => {
    const keys = buildSteps("trousers").map((s) => s.key);
    expect(keys).toEqual([
      "occasion", "type", "color", "contact", "trouserCut", "waistband", "trouserButtons", "pleats", "hem",
      "sizing", "recap", "summary", "payment",
    ]);
  });

  it("gives blazer only jacket-related steps — no trouser steps at all", () => {
    const keys = buildSteps("blazer").map((s) => s.key);
    expect(keys).not.toContain("trouserCut");
    expect(keys).not.toContain("waistband");
    expect(keys).not.toContain("pleats");
    expect(keys).toEqual([
      "occasion", "type", "color", "contact", "jacket", "jacketCut", "closure", "jacketButtons", "lining", "lapel", "monogram",
      "sizing", "recap", "summary", "payment",
    ]);
  });

  it("gives a full suit both the jacket steps and the trouser steps, in order", () => {
    const keys = buildSteps("suit").map((s) => s.key);
    const jacketEnd = keys.indexOf("monogram");
    const trouserStart = keys.indexOf("trouserCut");
    expect(jacketEnd).toBeGreaterThan(-1);
    expect(trouserStart).toBe(jacketEnd + 1);
    expect(keys).toEqual([
      "occasion", "type", "color", "contact", "jacket", "jacketCut", "closure", "jacketButtons", "lining", "lapel", "monogram",
      "trouserCut", "waistband", "trouserButtons", "pleats", "hem",
      "sizing", "recap", "summary", "payment",
    ]);
  });

  it("gives the shirt flow its own steps — no jacket/trouser steps leaking in", () => {
    const keys = buildSteps("shirt").map((s) => s.key);
    expect(keys).toEqual([
      "occasion", "type", "shirtColor", "contact", "shirtFit", "shirtCollar", "shirtCuff", "shirtMonogram",
      "sizing", "recap", "summary", "payment",
    ]);
    expect(keys).not.toContain("jacket");
    expect(keys).not.toContain("trouserCut");
    expect(keys).not.toContain("monogram");
  });

  it("has no duplicate step keys within a single flow", () => {
    for (const type of ["suit", "blazer", "trousers", "shirt"]) {
      const keys = buildSteps(type).map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

describe("JACKET_CUT_TO_TROUSER_CUT", () => {
  it("maps every jacket cut to a real trouser cut recommendation", () => {
    expect(JACKET_CUT_TO_TROUSER_CUT).toEqual({ classic: "classic", slim: "slim", relaxed: "loose" });
  });
});
