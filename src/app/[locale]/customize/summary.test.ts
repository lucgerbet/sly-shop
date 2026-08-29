import { describe, it, expect } from "vitest";
import { buildSummaryRows as buildSummaryRowsRaw } from "./summary";
import { frConfiguratorT } from "./frTranslator";
import type { Config } from "./data";

// The CRM/order-notification payload is always French (see frTranslator.ts)
// — tests exercise that exact translator so they double as a regression
// guard on the French copy, same as before this file took a translator param.
function buildSummaryRows(config: Config) {
  return buildSummaryRowsRaw(config, frConfiguratorT);
}

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

function rowValue(rows: [string, string][], label: string): string | undefined {
  return rows.find(([l]) => l === label)?.[1];
}

describe("buildSummaryRows", () => {
  it("looks up real labels, never raw ids — this is what the client's order email shows", () => {
    const config: Config = {
      ...emptyConfig,
      type: "blazer",
      jacketStyle: "roma", // raw id — the label is "Notch"
      jacketCut: "classic",
      closure: "two",
      jacketButtons: "marron",
      lining: "full",
      lapel: "notch",
      lapelWidth: "9,5",
      colorType: "solid",
      colorFamily: "bleu",
      color: "navy",
      occasion: "business", // raw id — the label is "Business"
    };
    const rows = buildSummaryRows(config);
    expect(rowValue(rows, "Occasion")).toBe("Business");
    expect(rowValue(rows, "Style de veste")).toBe("Notch");
    expect(rowValue(rows, "Style de veste")).not.toContain("roma");
    expect(rowValue(rows, "Boutons veste")).toBe("Corne marron");
    expect(rowValue(rows, "Couleur / Motif")).toContain("Bleu");
    expect(rowValue(rows, "Couleur / Motif")).toContain("Navy");
  });

  it("only includes jacket rows for jacket-having pieces, and trouser rows for trouser-having pieces", () => {
    const trousersOnly: Config = { ...emptyConfig, type: "trousers", trouserCut: "classic", waistband: "standard", waistbandWidth: "3,5 cm" };
    const rows = buildSummaryRows(trousersOnly);
    expect(rowValue(rows, "Style de veste")).toBeUndefined();
    expect(rowValue(rows, "Coupe du pantalon")).toBe("Classique");
  });

  it("marks a custom color choice clearly, without a broken family/shade lookup", () => {
    const config: Config = { ...emptyConfig, type: "blazer", colorType: "custom" };
    const rows = buildSummaryRows(config);
    expect(rowValue(rows, "Couleur / Motif")).toBe("À définir avec Luc (sur mesure)");
  });

  it("the displayed deposit always matches the real Stripe charge (pricing.ts), never a hardcoded string", () => {
    const rows = buildSummaryRows({ ...emptyConfig, type: "suit" });
    // Regression guard for the incident where the UI said "150 €" while
    // Stripe actually charged a leftover test value.
    expect(rowValue(rows, "Acompte à régler")).toMatch(/^\d+ €$/);
  });

  it("shows shirt-specific rows, no jacket/trouser rows, and a single full-payment row instead of a deposit", () => {
    const config: Config = {
      ...emptyConfig,
      type: "shirt",
      shirtFabric: "blanc",
      shirtFit: "classic",
      shirtCollar: "italien",
      shirtCuff: "simple",
      neckSize: "40",
      sleeveLength: "64",
    };
    const rows = buildSummaryRows(config);
    expect(rowValue(rows, "Tissu")).toBe("Blanc");
    expect(rowValue(rows, "Coupe")).toBe("Classique");
    expect(rowValue(rows, "Col")).toBe("Col italien");
    expect(rowValue(rows, "Poignet")).toBe("Poignet simple");
    expect(rowValue(rows, "Style de veste")).toBeUndefined();
    expect(rowValue(rows, "Coupe du pantalon")).toBeUndefined();
    expect(rowValue(rows, "Couleur / Motif")).toBeUndefined();
    expect(rowValue(rows, "Mensurations")).toBe("tour de cou 40cm · manches 64cm");
    expect(rowValue(rows, "Acompte à régler")).toBeUndefined();
    expect(rowValue(rows, "Montant à régler")).toBe("135 € (payé en une fois)");
  });
});
