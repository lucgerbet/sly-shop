import { describe, it, expect } from "vitest";
import { isStepValid } from "./validation";
import type { Config } from "./data";

const emptyConfig: Config = {
  occasion: "", type: "", jacketStyle: "", jacketCut: "", closure: "", lining: "",
  monogram: false, monogramPlacement: "", monogramInitials: "", monogramColor: "",
  colorType: "", colorFamily: "", color: "", pattern: "",
  jacketButtons: "", lapel: "", lapelWidth: "",
  trouserCut: "", waistband: "", waistbandWidth: "", trouserButtons: "", pleats: "", hem: "", trouserLining: "",
  shirtFabric: "", shirtFit: "", shirtCollar: "", shirtCuff: "",
  height: "", weight: "", jacketSize: "", waistSize: "", neckSize: "", sleeveLength: "",
  hasTapeMeasure: "", shippingAddress: "", shippingCity: "", shippingZip: "",
  firstName: "", lastName: "", email: "", message: "", referredBy: "", promoCode: "",
};

describe("isStepValid — occasion step", () => {
  it("requires an occasion to be picked, the very first step", () => {
    expect(isStepValid("occasion", emptyConfig)).toBe(false);
    expect(isStepValid("occasion", { ...emptyConfig, occasion: "business" })).toBe(true);
  });
});

describe("isStepValid — color step", () => {
  it("requires family + shade + finish for a plain 'solid' choice", () => {
    expect(isStepValid("color", { ...emptyConfig, colorType: "solid" })).toBe(false);
    expect(isStepValid("color", { ...emptyConfig, colorType: "solid", colorFamily: "bleu", color: "navy" })).toBe(true);
  });

  it("also requires a pattern type when the finish is 'pattern'", () => {
    const base = { ...emptyConfig, colorType: "pattern" as const, colorFamily: "bleu", color: "navy" };
    expect(isStepValid("color", base)).toBe(false);
    expect(isStepValid("color", { ...base, pattern: "stripes" })).toBe(true);
  });

  it("the free-choice 'custom' option is valid on its own, no family/shade needed", () => {
    expect(isStepValid("color", { ...emptyConfig, colorType: "custom" })).toBe(true);
  });
});

describe("isStepValid — monogram step", () => {
  it("is valid by default (monogram off)", () => {
    expect(isStepValid("monogram", emptyConfig)).toBe(true);
  });

  it("requires placement, initials, and thread color once monogram is on", () => {
    expect(isStepValid("monogram", { ...emptyConfig, monogram: true })).toBe(false);
    expect(isStepValid("monogram", {
      ...emptyConfig, monogram: true, monogramPlacement: "inside", monogramInitials: "LG", monogramColor: "gold",
    })).toBe(true);
  });
});

describe("isStepValid — shirt steps", () => {
  it("requires the fabric, fit, collar, and cuff to each be picked", () => {
    expect(isStepValid("shirtColor", emptyConfig)).toBe(false);
    expect(isStepValid("shirtColor", { ...emptyConfig, shirtFabric: "blanc" })).toBe(true);
    expect(isStepValid("shirtColor", { ...emptyConfig, shirtFabric: "custom" })).toBe(true);
    expect(isStepValid("shirtFit", { ...emptyConfig, shirtFit: "classic" })).toBe(true);
    expect(isStepValid("shirtCollar", { ...emptyConfig, shirtCollar: "italien" })).toBe(true);
    expect(isStepValid("shirtCuff", { ...emptyConfig, shirtCuff: "simple" })).toBe(true);
  });

  it("shirtMonogram follows the same on/off + fields-when-on rule as the jacket monogram step", () => {
    expect(isStepValid("shirtMonogram", emptyConfig)).toBe(true);
    expect(isStepValid("shirtMonogram", { ...emptyConfig, monogram: true })).toBe(false);
    expect(isStepValid("shirtMonogram", {
      ...emptyConfig, monogram: true, monogramPlacement: "cuff", monogramInitials: "LG", monogramColor: "white",
    })).toBe(true);
  });
});

describe("isStepValid — sizing step", () => {
  it("requires height, weight, and a tape-measure answer", () => {
    expect(isStepValid("sizing", emptyConfig)).toBe(false);
    expect(isStepValid("sizing", { ...emptyConfig, height: "180", weight: "75", hasTapeMeasure: "yes" })).toBe(true);
  });

  it("requires neck size and sleeve length instead, for a shirt", () => {
    expect(isStepValid("sizing", { ...emptyConfig, type: "shirt", height: "180", weight: "75", hasTapeMeasure: "yes" })).toBe(false);
    expect(isStepValid("sizing", { ...emptyConfig, type: "shirt", neckSize: "40", sleeveLength: "64", hasTapeMeasure: "yes" })).toBe(true);
  });

  it("requires a shipping address only when the client needs a tape measure sent", () => {
    const base = { ...emptyConfig, height: "180", weight: "75", hasTapeMeasure: "no" as const };
    expect(isStepValid("sizing", base)).toBe(false);
    expect(isStepValid("sizing", { ...base, shippingAddress: "12 rue de la Paix", shippingCity: "Paris", shippingZip: "75002" })).toBe(true);
  });
});

describe("isStepValid — simple required-field steps", () => {
  it("waistband needs both the style and a width", () => {
    expect(isStepValid("waistband", { ...emptyConfig, waistband: "standard" })).toBe(false);
    expect(isStepValid("waistband", { ...emptyConfig, waistband: "standard", waistbandWidth: "3,5 cm" })).toBe(true);
  });

  it("lapel needs both the style and a width", () => {
    expect(isStepValid("lapel", { ...emptyConfig, lapel: "notch" })).toBe(false);
    expect(isStepValid("lapel", { ...emptyConfig, lapel: "notch", lapelWidth: "9,5" })).toBe(true);
  });

  it("recap/payment steps have nothing to fill in — always valid", () => {
    expect(isStepValid("recap", emptyConfig)).toBe(true);
    expect(isStepValid("payment", emptyConfig)).toBe(true);
  });
});

describe("isStepValid — contact step", () => {
  it("requires a first name, last name, and a well-formed email", () => {
    expect(isStepValid("contact", emptyConfig)).toBe(false);
    expect(isStepValid("contact", { ...emptyConfig, firstName: "Jean" })).toBe(false);
    expect(isStepValid("contact", { ...emptyConfig, firstName: "Jean", lastName: "Dupont" })).toBe(false);
    expect(isStepValid("contact", { ...emptyConfig, firstName: "Jean", lastName: "Dupont", email: "not-an-email" })).toBe(false);
    expect(isStepValid("contact", { ...emptyConfig, firstName: "Jean", lastName: "Dupont", email: "jean@example.com" })).toBe(true);
  });
});

describe("isStepValid — summary step", () => {
  it("has nothing required — name/email are already collected earlier, at the contact step", () => {
    expect(isStepValid("summary", emptyConfig)).toBe(true);
  });
});
