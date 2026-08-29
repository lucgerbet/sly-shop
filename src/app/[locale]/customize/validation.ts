import type { Config, StepKey } from "./data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Whether the client has filled in enough of the current step to move on.
// Pulled out of the Customize() component as a pure function so it can be
// unit-tested without mounting the whole configurator.
export function isStepValid(key: StepKey, config: Config): boolean {
  switch (key) {
    case "occasion": return !!config.occasion;
    case "type": return !!config.type;
    case "jacket": return !!config.jacketStyle;
    case "jacketCut": return !!config.jacketCut;
    case "closure": return !!config.closure;
    case "jacketButtons": return !!config.jacketButtons;
    case "lining": return !!config.lining;
    case "lapel": return !!config.lapel && !!config.lapelWidth;
    case "monogram": return !config.monogram || (!!config.monogramPlacement && !!config.monogramInitials && !!config.monogramColor);
    case "color": return config.colorType === "custom"
      ? true
      : !!config.colorFamily && !!config.color && !!config.colorType && (config.colorType === "pattern" ? !!config.pattern : true);
    // Moved here from "summary" (previously the last step before payment) —
    // capturing it this early is what makes an abandoned configuration
    // visible to Luc at all instead of vanishing without a trace.
    case "contact": return !!config.firstName && !!config.lastName && EMAIL_RE.test(config.email);
    case "trouserCut": return !!config.trouserCut;
    case "waistband": return !!config.waistband && !!config.waistbandWidth;
    case "trouserButtons": return !!config.trouserButtons;
    case "pleats": return !!config.pleats;
    case "hem": return !!config.hem;
    case "shirtColor": return !!config.shirtFabric;
    case "shirtFit": return !!config.shirtFit;
    case "shirtCollar": return !!config.shirtCollar;
    case "shirtCuff": return !!config.shirtCuff;
    case "shirtMonogram": return !config.monogram || (!!config.monogramPlacement && !!config.monogramInitials && !!config.monogramColor);
    case "sizing": {
      const hasTape = !!config.hasTapeMeasure
        && (config.hasTapeMeasure === "yes" || (!!config.shippingAddress && !!config.shippingCity && !!config.shippingZip));
      return config.type === "shirt"
        ? !!config.neckSize && !!config.sleeveLength && hasTape
        : !!config.height && !!config.weight && hasTape;
    }
    default: return true; // summary, recap, payment
  }
}
