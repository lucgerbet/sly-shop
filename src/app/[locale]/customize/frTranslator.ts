import { createTranslator } from "next-intl";
import frMessages from "../../../../messages/fr.json";

// Order data that reaches sly-crm (configSummary, sent from create-checkout-session
// and lead-capture) must always read in French — Luc works in French regardless
// of which language a client browsed the site in, same reasoning as the
// French-only legal pages in src/app/(legal).
export const frConfiguratorT = createTranslator({
  locale: "fr",
  messages: frMessages,
  namespace: "Configurator",
});
