import { PRICES, DEPOSIT_CENTS, getDisplayPriceCents, resolvePromoCode } from "@/lib/pricing";
import {
  OCCASIONS, TYPES, JACKET_STYLES, JACKET_CUTS, CLOSURES, LININGS, COLOR_FAMILIES, PATTERNS,
  TROUSER_CUTS, WAISTBANDS, PLEATS, HEMS, BUTTON_MATERIALS, LAPELS, TROUSER_LININGS,
  MONOGRAM_PLACEMENTS, MONOGRAM_COLORS,
  SHIRT_FABRICS, SHIRT_FITS, SHIRT_COLLARS, SHIRT_CUFFS, SHIRT_MONOGRAM_PLACEMENTS,
  type Config,
} from "./data";

// Same shape as both next-intl's useTranslations() return value and
// createTranslator()'s — callers pass whichever fits: the live locale's
// translator for on-screen display, or the always-French one (frTranslator.ts)
// for data sent to the CRM. See src/app/[locale]/customize/frTranslator.ts.
// `key: any` (not `string`) is deliberate: this function builds message keys
// dynamically (`options.${namespace}.${id}.label`), which next-intl's own
// strict per-namespace key union can't statically verify either way — typing
// it as `string` would make next-intl's actual translator type (whose `key`
// param is a specific literal union, not `string`) fail to satisfy this
// signature under contravariant parameter checking.
type Translator = (key: any, values?: any) => string;

// The single place that turns a Config into human-readable rows — used for
// the on-screen summary, the order-notification email, and (via the success
// page) the post-payment confirmation. Keeping this in one place is what
// guarantees the email a client's order generates always matches what they
// saw on screen, instead of two independently-maintained copies drifting.
export function buildSummaryRows(config: Config, t: Translator): [string, string][] {
  const opt = (namespace: string, id: string, field: string) => t(`options.${namespace}.${id}.${field}`);

  const selectedType = TYPES.find((ty) => ty.id === config.type);
  const selectedJacket = JACKET_STYLES.find((j) => j.id === config.jacketStyle);
  const selectedClosure = CLOSURES.find((c) => c.id === config.closure);
  const selectedLining = LININGS.find((l) => l.id === config.lining);
  const selectedColorFamily = COLOR_FAMILIES.find((f) => f.id === config.colorFamily);
  const selectedShade = selectedColorFamily?.shades.find((s) => s.id === config.color);
  const colorFamilyLabel = selectedColorFamily ? opt("colorFamilies", selectedColorFamily.id, "label") : "—";
  const shadeLabel = selectedShade ? t(`options.colorFamilies.${selectedColorFamily?.id}.shades.${selectedShade.id}`) : "";
  const colorSummary = config.colorType === "custom"
    ? t("summaryRows.colorCustom")
    : config.colorType === "pattern"
      ? `${colorFamilyLabel} ${shadeLabel} — ${config.pattern ? opt("patterns", config.pattern, "label") : "—"}`
      : `${colorFamilyLabel} — ${shadeLabel || "—"}`;
  const isTrousers = config.type === "trousers";
  const isSuit = config.type === "suit";
  const isShirt = config.type === "shirt";
  const hasTrousers = isSuit || isTrousers;
  const selectedShirtFabric = SHIRT_FABRICS.find((f) => f.id === config.shirtFabric);
  const selectedShirtFit = SHIRT_FITS.find((f) => f.id === config.shirtFit);
  const selectedShirtCollar = SHIRT_COLLARS.find((c) => c.id === config.shirtCollar);
  const selectedShirtCuff = SHIRT_CUFFS.find((c) => c.id === config.shirtCuff);
  const selectedShirtMonogramPlacement = SHIRT_MONOGRAM_PLACEMENTS.find((p) => p.id === config.monogramPlacement);
  const selectedTrouserCut = TROUSER_CUTS.find((ty) => ty.id === config.trouserCut);
  const selectedWaistband = WAISTBANDS.find((w) => w.id === config.waistband);
  const selectedPleats = PLEATS.find((p) => p.id === config.pleats);
  const selectedHem = HEMS.find((h) => h.id === config.hem);
  const selectedJacketButtons = BUTTON_MATERIALS.find((b) => b.id === config.jacketButtons);
  const selectedTrouserButtons = BUTTON_MATERIALS.find((b) => b.id === config.trouserButtons);
  const selectedLapel = LAPELS.find((l) => l.id === config.lapel);
  const selectedTrouserLining = TROUSER_LININGS.find((l) => l.id === config.trouserLining);

  const selectedMonogramPlacement = MONOGRAM_PLACEMENTS.find((p) => p.id === config.monogramPlacement);
  const selectedMonogramColor = MONOGRAM_COLORS.find((c) => c.id === config.monogramColor);

  const measurements = isShirt
    ? [
        config.neckSize ? `${t("summaryRows.neckSize")} ${config.neckSize}cm` : null,
        config.sleeveLength ? `${t("summaryRows.sleeveLength")} ${config.sleeveLength}cm` : null,
      ].filter(Boolean).join(" · ") || "—"
    : [
        config.height ? `${config.height}cm` : null,
        config.weight ? `${config.weight}kg` : null,
        !isTrousers && config.jacketSize ? `${t("summaryRows.jacketSize")} ${config.jacketSize}` : null,
        hasTrousers && config.waistSize ? `${t("summaryRows.waistSize")} ${config.waistSize}` : null,
      ].filter(Boolean).join(" · ") || "—";

  const paymentMode = PRICES[config.type]?.paymentMode ?? "deposit";
  const monogramNo = t("summaryRows.monogramNo");
  const monogramThread = t("summaryRows.monogramThread");

  return [
    [t("summaryRows.occasion"), config.occasion ? opt("occasions", config.occasion, "label") : "—"],
    [t("summaryRows.piece"), selectedType ? opt("types", selectedType.id, "label") : "—"],
    ...(isShirt ? [] : [[t("summaryRows.colorMotif"), colorSummary]] as [string, string][]),
    ...(isShirt ? [
      [t("summaryRows.fabric"), config.shirtFabric === "custom" ? t("summaryRows.colorCustom") : selectedShirtFabric ? opt("shirtFabrics", selectedShirtFabric.id, "label") : "—"],
      [t("summaryRows.cut"), selectedShirtFit ? opt("shirtFits", selectedShirtFit.id, "label") : "—"],
      [t("summaryRows.collar"), selectedShirtCollar ? opt("shirtCollars", selectedShirtCollar.id, "label") : "—"],
      [t("summaryRows.cuff"), selectedShirtCuff ? opt("shirtCuffs", selectedShirtCuff.id, "label") : "—"],
      [t("summaryRows.monogram"), config.monogram
        ? `${config.monogramInitials} · ${selectedShirtMonogramPlacement ? opt("shirtMonogramPlacements", selectedShirtMonogramPlacement.id, "label") : ""} · ${monogramThread} ${selectedMonogramColor ? t(`options.monogramColors.${selectedMonogramColor.id}`) : ""}`
        : monogramNo],
    ] as [string, string][] : []),
    ...(!isTrousers && !isShirt ? [
      [t("summaryRows.jacketStyle"), selectedJacket ? opt("jacketStyles", selectedJacket.id, "label") : "—"],
      [t("summaryRows.jacketCut"), config.jacketCut ? opt("jacketCuts", config.jacketCut, "label") : "—"],
      [t("summaryRows.closure"), selectedClosure ? opt("closures", selectedClosure.id, "label") : "—"],
      [t("summaryRows.jacketButtons"), selectedJacketButtons ? opt("buttonMaterials", selectedJacketButtons.id, "label") : "—"],
      [t("summaryRows.lining"), selectedLining ? opt("linings", selectedLining.id, "label") : "—"],
      [t("summaryRows.lapel"), `${selectedLapel ? opt("lapels", selectedLapel.id, "label") : "—"} · ${config.lapelWidth ? `${config.lapelWidth} cm` : "—"}`],
      [t("summaryRows.monogram"), config.monogram
        ? `${config.monogramInitials} · ${selectedMonogramPlacement ? opt("monogramPlacements", selectedMonogramPlacement.id, "label") : ""} · ${monogramThread} ${selectedMonogramColor ? t(`options.monogramColors.${selectedMonogramColor.id}`) : ""}`
        : monogramNo],
    ] as [string, string][] : []),
    ...(hasTrousers ? [
      [t("summaryRows.trouserCut"), selectedTrouserCut ? opt("trouserCuts", selectedTrouserCut.id, "label") : "—"],
    ] as [string, string][] : []),
    ...(hasTrousers ? [
      [t("summaryRows.waistband"), `${selectedWaistband ? opt("waistbands", selectedWaistband.id, "label") : "—"} · ${config.waistbandWidth || "—"}`],
      [t("summaryRows.trouserButtons"), selectedTrouserButtons ? opt("buttonMaterials", selectedTrouserButtons.id, "label") : "—"],
      [t("summaryRows.pleats"), selectedPleats ? opt("pleats", selectedPleats.id, "label") : "—"],
      [t("summaryRows.hem"), selectedHem ? opt("hems", selectedHem.id, "label") : "—"],
      [t("summaryRows.trouserLining"), selectedTrouserLining ? opt("trouserLinings", selectedTrouserLining.id, "label") : "—"],
    ] as [string, string][] : []),
    [t("summaryRows.measurements"), measurements],
    [t("summaryRows.tapeMeasure"), config.hasTapeMeasure === "no"
      ? `${t("summaryRows.tapeMeasureShip")} · ${config.shippingAddress}, ${config.shippingZip} ${config.shippingCity}`
      : t("summaryRows.tapeMeasureReady")],
    ...(paymentMode === "full" ? [
      [t("summaryRows.amountFull"), `${(getDisplayPriceCents(config.type, config.promoCode) / 100).toFixed(0)} € ${t("summaryRows.amountFullSuffix")}`],
    ] as [string, string][] : [
      (() => {
        const promo = resolvePromoCode(config.type, config.promoCode);
        const price = `${(getDisplayPriceCents(config.type, config.promoCode) / 100).toFixed(0)} €`;
        return promo ? [t("summaryRows.price"), `${price} (${promo.label} — code ${promo.code})`] : [t("summaryRows.price"), selectedType?.price ?? "—"];
      })() as [string, string],
      [t("summaryRows.deposit"), `${(DEPOSIT_CENTS / 100).toFixed(0)} €`],
    ] as [string, string][]),
    [t("summaryRows.delay"), t("summaryRows.delayValue")],
  ];
}
