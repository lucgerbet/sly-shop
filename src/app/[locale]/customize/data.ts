// Shared between the configurator (page.tsx) and the post-payment success
// page — the single source of truth for product data, the Config shape, and
// step order, so the two never drift into showing different labels for the
// same stored answers.

// Asked before anything else — purely informational for Luc (shown in the
// order recap/email) rather than driving any downstream recommendation, so
// it doesn't interact with the jacketCut→trouserCut logic further down.
export const OCCASIONS = [
  { id: "ceremony", label: "Cérémonie", sub: "Mariage, gala, grand événement.", detail: "Une allure formelle et intemporelle, pensée pour marquer les grandes occasions." },
  { id: "business", label: "Business", sub: "Bureau, rendez-vous professionnels.", detail: "Un costume qui inspire confiance et sérieux au quotidien professionnel." },
  { id: "casual", label: "Casual", sub: "Sorties, tenue décontractée chic.", detail: "Une coupe plus libre, pour un usage moins formel sans perdre en élégance." },
  { id: "daily", label: "Quotidien", sub: "Porté très régulièrement.", detail: "Une pièce polyvalente et confortable, taillée pour durer, au fil des jours." },
];

export const TYPES = [
  { id: "suit", label: "Costume Deux Pièces", sub: "Blazer + Pantalon", price: "645 €" },
  { id: "blazer", label: "Blazer", sub: "Haut uniquement", price: "475 €" },
  { id: "trousers", label: "Pantalon", sub: "Bas uniquement", price: "199 €" },
  { id: "shirt", label: "Chemise sur mesure", sub: "Réglée en une fois", price: "135 €" },
];

// Trouser cuts — the single style choice for both the "suit" trouser section
// and the standalone "trousers" flow, so both use the exact same photos/copy.
export const TROUSER_CUTS = [
  { id: "classic", label: "Classique", sub: "Jambe droite, tombé net.", detail: "Un pantalon intemporel, ni trop près ni trop ample. S'accorde avec toutes les vestes.", photo: "/photos/trousers/classic.jpg" },
  { id: "slim", label: "Slim", sub: "Ajusté sur toute la jambe.", detail: "Silhouette moderne et épurée, resserrée vers la cheville. Idéal avec une veste ajustée.", photo: "/photos/trousers/slim.jpg" },
  { id: "loose", label: "Loose", sub: "Jambe ample, tombé fluide.", detail: "Coupe décontractée et contemporaine, plus de liberté de mouvement. Parfait avec une veste relaxed.", photo: "/photos/trousers/loose.jpg" },
];

// The jacket cut (classic/slim/relaxed) is what drives the trouser cut
// recommendation — a relaxed jacket suggests a looser trouser, not a name match.
export const JACKET_CUT_TO_TROUSER_CUT: Record<string, string> = { classic: "classic", slim: "slim", relaxed: "loose" };

export const JACKET_STYLES = [
  {
    id: "roma",
    label: "Notch",
    sub: "Construction classique, épaules légères & revers encoché.",
    detail: "Structure traditionnelle sans excès, revers encoché. Le costume de cérémonie par excellence.",
    photo: "/photos/jackets/notch.jpg",
  },
  {
    id: "milano",
    label: "Milano",
    sub: "Construction classique, épaules légères & revers pointu.",
    detail: "Même structure traditionnelle que le Notch, mais avec un revers pointu plus affirmé.",
    photo: "/photos/jackets/milano.jpg",
  },
  {
    id: "dracula",
    label: "Dracula",
    sub: "Épaules structurées & revers en pics.",
    detail: "Allure puissante et charismatique. Épaules structurées et revers en pointe qui allongent le torse. Idéale pour les cérémonies de prestige et les soirées.",
    photo: "/photos/jackets/dracula.jpg",
  },
];

// Overall silhouette/fit of the jacket — independent of lapel style (JACKET_STYLES above).
export const JACKET_CUTS = [
  { id: "classic", label: "Classique", sub: "Coupe droite, épaules naturelles, intemporel", detail: "Une coupe intemporelle, confortable, qui ne se démode jamais. Idéale au quotidien." },
  { id: "slim", label: "Slim", sub: "Silhouette ajustée, moderne, épuré", detail: "Plus près du corps pour une silhouette affinée et actuelle." },
  { id: "relaxed", label: "Relaxed", sub: "Coupe ample, décontractée, contemporaine", detail: "Plus de liberté de mouvement, un tombé plus souple et décontracté." },
];

export const WAISTBANDS = [
  {
    id: "standard",
    label: "Standard",
    sub: "Ceinture classique, bouton apparent.",
    detail: "Un montage simple et polyvalent, avec passants, prévu pour porter une ceinture.",
    photo: "/photos/waistbands/standard.jpg",
    widthLabel: "3,5 cm",
  },
  {
    id: "double",
    label: "Double réglage",
    sub: "Boucles réglables des deux côtés.",
    detail: "Style d'inspiration militaire : deux boucles réglables sur les hanches et une façade continue, sans ceinture.",
    photo: "/photos/waistbands/double.jpg",
    widthLabel: "5 cm",
  },
];

export const WAIST_SIZES = ["36", "38", "40", "42", "44", "46", "48+"];

export const PLEATS = [
  {
    id: "none",
    label: "Sans pli",
    sub: "Devant plat (flat front).",
    detail: "Le pantalon tombe droit contre la jambe. Allure nette, moderne et polyvalente.",
    photo: "/photos/pleats/none.jpg",
  },
  {
    id: "single",
    label: "Pli simple",
    sub: "Un pli par jambe.",
    detail: "Un pli qui s'ouvre vers la couture latérale. Plus d'aisance à la taille et de confort assis.",
    photo: "/photos/pleats/single.jpg",
  },
  {
    id: "double",
    label: "Double pli",
    sub: "Deux plis par jambe.",
    detail: "Deux plis qui s'ouvrent vers la couture latérale. Style classique, maximum d'ampleur et de confort.",
    photo: "/photos/pleats/double.jpg",
  },
];

export const HEMS = [
  {
    id: "plain",
    label: "Ourlet simple",
    sub: "Finition nette, sans revers.",
    detail: "Le tissu est replié à l'intérieur de la jambe pour une finition propre. Le fini le plus classique et polyvalent.",
    photo: "/photos/hems/plain.jpg",
  },
  {
    id: "turnup4",
    label: "Revers 4 cm",
    sub: "Revers de 4 cm.",
    detail: "Un revers qui dévoile davantage la cheville, allonge la silhouette et ajoute du poids pour un meilleur tombé.",
    photo: "/photos/hems/turnup4.jpg",
  },
];

export const CLOSURES = [
  {
    id: "one",
    label: "1 Bouton",
    sub: "Minimaliste et élégant.",
    detail: "Allonge la silhouette, met en valeur le revers. Idéal pour les occasions formelles ou les soirées.",
    photo: "/photos/closures/one.jpg",
  },
  {
    id: "two",
    label: "2 Boutons",
    sub: "La fermeture classique.",
    detail: "Polyvalente et moderne, adaptée à toutes les occasions. Le choix le plus répandu dans la taillerie contemporaine.",
    photo: "/photos/closures/two.jpg",
  },
  {
    id: "db4x2",
    label: "Croisé",
    sub: "Double boutonnage, allure affirmée.",
    detail: "Deux rangées de boutons croisées. Inspire confiance et autorité. Un choix audacieux pour se démarquer.",
    photo: "/photos/closures/db4x2.jpg",
  },
];

export const LININGS = [
  {
    id: "full",
    label: "Doublure complète",
    sub: "Corps et manches entièrement doublés.",
    detail: "Tomber parfait, glissement impeccable à l'enfilage. Finition premium. Idéal pour les costumes formels et les saisons froides.",
    photo: "/photos/linings/full.jpg",
  },
  {
    id: "half",
    label: "Demi-doublure",
    sub: "Doublée sur la moitié supérieure seulement.",
    detail: "Plus respirante que la doublure complète, tout en gardant la structure de la veste. Parfaite pour le printemps et l'été.",
    photo: "/photos/linings/half.jpg",
  },
  {
    id: "none",
    label: "Sans doublure",
    sub: "Entièrement non doublée.",
    detail: "Ultra-légère et respirante. Look décontracté et artisanal. Recommandée pour les tissus d'été comme le lin ou le coton.",
    photo: "/photos/linings/none.jpg",
  },
];

// "Under the collar" placement was offered at launch but the atelier doesn't
// actually produce it — removed rather than left selectable for nothing.
export const MONOGRAM_PLACEMENTS = [
  { id: "inside", label: "Intérieur veste", sub: "Brodé sur le côté gauche de la doublure intérieure." },
];

export const MONOGRAM_COLORS = [
  { id: "white", label: "Blanc", hex: "#f5f5f0" },
  { id: "silver", label: "Argent", hex: "#c0c0c0" },
  { id: "grey", label: "Gris", hex: "#808080" },
  { id: "light-blue", label: "Bleu Ciel", hex: "#a8c8e8" },
  { id: "navy", label: "Marine", hex: "#1a2744" },
  { id: "burgundy", label: "Bordeaux", hex: "#5a1f24" },
  { id: "gold", label: "Or", hex: "#c9a84c" },
  { id: "black", label: "Noir", hex: "#111111" },
];

// `texture` is an optional photo of the real fabric (from the atelier's fabric
// book). When present it replaces the flat hex swatch. Drop the file in
// public/photos/fabrics/ and set the path here.
// Each family is a base tone; the client narrows down to one of 3 shades
// before choosing solid vs. patterned — mirrors how the choice actually
// unfolds in a fitting with real swatches.
export const COLOR_FAMILIES: { id: string; label: string; hex: string; shades: { id: string; label: string; hex: string; texture?: string }[] }[] = [
  {
    id: "bleu",
    label: "Bleu",
    hex: "#1a2744",
    shades: [
      { id: "navy", label: "Navy", hex: "#3f3d56", texture: "/photos/fabrics/navy.jpg" },
      { id: "dark-blue", label: "Bleu Nuit", hex: "#0d1b33" },
      { id: "cobalt", label: "Bleu Cobalt", hex: "#575a79", texture: "/photos/fabrics/cobalt.jpg" },
    ],
  },
  {
    id: "gris",
    label: "Gris",
    hex: "#3a3a3a",
    shades: [
      { id: "anthracite", label: "Anthracite", hex: "#404148", texture: "/photos/fabrics/anthracite.jpg" },
      { id: "gris-moyen", label: "Gris Moyen", hex: "#6e6e6e" },
      { id: "gris-perle", label: "Gris Perle", hex: "#848282", texture: "/photos/fabrics/gris-perle.jpg" },
    ],
  },
  {
    id: "noir",
    label: "Noir",
    hex: "#111111",
    shades: [
      { id: "noir-profond", label: "Noir Profond", hex: "#0a0a0a" },
      { id: "noir-mat", label: "Noir Mat", hex: "#1c1c1c" },
      { id: "noir-bleute", label: "Noir Bleuté", hex: "#14181f" },
    ],
  },
  {
    id: "vert",
    label: "Vert Foncé",
    hex: "#2f4433",
    shades: [
      { id: "bouteille", label: "Vert Bouteille", hex: "#1f3b2a" },
      { id: "sapin", label: "Vert Sapin", hex: "#2c4a37" },
      { id: "olive", label: "Vert Olive Foncé", hex: "#3c4530" },
    ],
  },
  {
    id: "marron",
    label: "Marron",
    hex: "#5c3d2e",
    shades: [
      { id: "chocolat", label: "Chocolat", hex: "#4a2f22" },
      { id: "cognac", label: "Cognac", hex: "#d19243", texture: "/photos/fabrics/cognac.jpg" },
      { id: "chataigne", label: "Châtaigne", hex: "#6b4530" },
    ],
  },
  {
    id: "beige",
    label: "Beige",
    hex: "#c8b49a",
    shades: [
      { id: "sable", label: "Sable", hex: "#cfb896", texture: "/photos/fabrics/sable.jpg" },
      { id: "taupe", label: "Taupe", hex: "#b3a084" },
      { id: "lin", label: "Lin", hex: "#e3d7bf" },
    ],
  },
];

export const PATTERNS = [
  { id: "checks", label: "Carreaux", sub: "Glen plaid, Prince de Galles, Windowpane…", detail: "Discrets ou affirmés, les carreaux donnent du caractère sans forcer le trait." },
  { id: "stripes", label: "Rayures", sub: "Chalk stripe, Pinstripe, Bandes tennis…", detail: "Les rayures allongent la silhouette. Un classique du costume anglais et italien." },
  { id: "exotic", label: "Motifs exotiques", sub: "Chevron (Herringbone), Houndstooth, Birdseye, Madras…", detail: "Pour les connaisseurs qui veulent se démarquer avec subtilité." },
];

// Shared by both the jacket and the trouser "buttons" steps.
// `swatchHex` is a representative flat color used only by the live SVG
// preview (LivePreview.tsx) — not meant to be a precise color match to the
// real photo, just close enough to read correctly at button-dot scale.
export const BUTTON_MATERIALS = [
  { id: "marron", label: "Corne marron", sub: "Corne naturelle ambrée.", detail: "Le grand classique du sur-mesure : reflets ambrés et marbrures chaudes, chaque bouton est légèrement unique.", photo: "/photos/buttons/marron.jpg", swatchHex: "#a8722e" },
  { id: "brun-craquele", label: "Corne brun foncé", sub: "Effet craquelé mat.", detail: "Un brun profond à la texture naturellement craquelée, pour une finition discrète et affirmée à la fois.", photo: "/photos/buttons/brun-craquele.jpg", swatchHex: "#4a3728" },
  { id: "noir", label: "Corne noire", sub: "Finition mate profonde.", detail: "Un noir mat et uni, résolument sobre. S'accorde à toutes les couleurs de tissu.", photo: "/photos/buttons/noir.jpg", swatchHex: "#1c1c1e" },
  { id: "marbre", label: "Corne marbrée", sub: "Effet marbré noir & gris.", detail: "Des veines grises et blanches sur fond sombre, pour un bouton au caractère plus graphique.", photo: "/photos/buttons/marbre.jpg", swatchHex: "#5a5a5a" },
  { id: "bleu", label: "Corne teintée bleu", sub: "Teinte bleu profond.", detail: "Une corne teintée dans un bleu nuit intense, pour une touche de couleur discrète et raffinée.", photo: "/photos/buttons/bleu.jpg", swatchHex: "#243a5e" },
  { id: "ivoire", label: "Corne ivoire", sub: "Clair, bord fumé.", detail: "Un ton clair et lumineux aux bords légèrement fumés, idéal pour les tissus clairs et les tenues d'été.", photo: "/photos/buttons/ivoire.jpg", swatchHex: "#e4d9c2" },
];

export const LAPELS = [
  { id: "notch", label: "Revers encoché", sub: "Notch, le revers classique.", detail: "La forme la plus polyvalente, avec une encoche nette entre le col et le revers. S'accorde à toutes les occasions.", photo: "/photos/lapels/notch-95.jpg", widthLabel: "9,5 cm" },
  { id: "peak", label: "Revers en pointe", sub: "Peak, allure affirmée.", detail: "Un revers qui pointe vers le haut, plus formel et affirmé. Associé traditionnellement aux vestes croisées et aux tenues de cérémonie.", photo: "/photos/lapels/peak-11.jpg", widthLabel: "11 cm" },
];

export const LAPEL_WIDTHS = [
  { id: "8,5", label: "8,5 cm", sub: "Fin et discret : un revers low-profile, à l'épure très contemporaine, pour une silhouette resserrée." },
  { id: "9,5", label: "9,5 cm", sub: "Notre recommandation : assez de présence pour donner du caractère à la veste, sans jamais tomber dans l'excès." },
  { id: "11", label: "11 cm", sub: "Large et affirmé : le revers du power suit, pour une allure imposante qui capte immédiatement le regard." },
];

export const WAISTBAND_WIDTHS = ["3,5 cm", "4 cm", "5 cm"];

export const TROUSER_LININGS = [
  { id: "full", label: "Doublure complète", sub: "Jambe entièrement doublée.", detail: "Confort maximal et glissement parfait à l'enfilage. Idéal pour l'hiver et les tissus structurés." },
  { id: "half", label: "Demi-doublure", sub: "Doublée jusqu'au genou.", detail: "Un bon compromis entre confort et respirabilité : limite les frottements sans alourdir le pantalon." },
  { id: "none", label: "Sans doublure", sub: "Entièrement non doublé.", detail: "Léger et respirant, pour les tissus d'été comme le lin ou le coton léger." },
];

// The shirt fabric picker is deliberately a single flat list, not the suit's
// family→shade→solid/pattern cascade — no real fabric photos exist for shirt
// cotton yet (unlike the 6 wool swatches under public/photos/fabrics/), and a
// 135€ shirt doesn't warrant the same depth of choice as a 645€ suit. Flat hex
// swatches only, same honest "no photo yet" pattern already used for the
// suit shades that don't have a texture photo either.
export const SHIRT_FABRICS = [
  { id: "blanc", label: "Blanc", hex: "#f7f6f2", sub: "Le grand classique, toujours juste." },
  { id: "bleu-ciel", label: "Bleu ciel", hex: "#aac4dd", sub: "Frais et polyvalent, le plus porté après le blanc." },
  { id: "bleu-fonce", label: "Bleu foncé", hex: "#2c3e5c", sub: "Plus affirmé, se porte aussi bien seul qu'avec un costume." },
  { id: "rose-pale", label: "Rose pâle", hex: "#e8c9c9", sub: "Une touche de couleur discrète, très portée en business." },
  { id: "raye-bleu", label: "Rayures bleues", hex: "#c3d3e3", sub: "Fines rayures sur fond clair, un classique anglais." },
  { id: "raye-fine", label: "Rayures ton sur ton", hex: "#e9e6df", sub: "Une texture discrète, presque unie de loin." },
];

export const SHIRT_FITS = [
  { id: "classic", label: "Classique", sub: "Coupe droite, confortable.", detail: "Une coupe intemporelle avec de l'aisance sur tout le buste. Le choix le plus polyvalent au quotidien." },
  { id: "slim", label: "Ajustée", sub: "Silhouette resserrée, moderne.", detail: "Plus près du corps à la taille et aux bras, pour une allure nette — parfaite portée sous une veste." },
  { id: "relaxed", label: "Décontractée", sub: "Coupe ample, tombé fluide.", detail: "Plus de liberté de mouvement et un tombé plus souple — à l'aise en dehors du bureau." },
];

export const SHIRT_COLLARS = [
  { id: "italien", label: "Col italien", sub: "Pointes écartées, moderne.", detail: "Un col ouvert et élégant, avec ou sans cravate — le plus polyvalent aujourd'hui." },
  { id: "boutonne", label: "Col boutonné", sub: "Button-down, décontracté-chic.", detail: "Les pointes du col se boutonnent sur la chemise — un classique américain, parfait sans cravate." },
  { id: "francais", label: "Col français", sub: "Pointes droites, classique.", detail: "Le col le plus formel, taillé pour la cravate ou le nœud papillon." },
];

export const SHIRT_CUFFS = [
  { id: "simple", label: "Poignet simple", sub: "Un bouton, discret.", detail: "Le poignet du quotidien, aussi facile à porter avec ou sans veste." },
  { id: "mousquetaire", label: "Poignet mousquetaire", sub: "Pour boutons de manchette.", detail: "Se ferme avec des boutons de manchette — la touche la plus formelle, pour les grandes occasions." },
];

export const SHIRT_MONOGRAM_PLACEMENTS = [
  { id: "cuff", label: "Poignet", sub: "Brodé sur le poignet, discret et classique." },
  { id: "tail", label: "Bas de chemise", sub: "Brodé en bas, invisible une fois portée." },
];

export type ProductType = "" | "suit" | "blazer" | "trousers" | "shirt";
export type ColorType = "" | "solid" | "pattern" | "custom";
export type YesNo = "" | "yes" | "no";

export type Config = {
  occasion: string;
  type: ProductType;
  jacketStyle: string;
  jacketCut: string;
  closure: string;
  lining: string;
  monogram: boolean;
  monogramPlacement: string;
  monogramInitials: string;
  monogramColor: string;
  colorType: ColorType;
  colorFamily: string;
  color: string;
  pattern: string;
  jacketButtons: string;
  lapel: string;
  lapelWidth: string;
  trouserCut: string;
  waistband: string;
  waistbandWidth: string;
  trouserButtons: string;
  pleats: string;
  hem: string;
  trouserLining: string;
  shirtFabric: string;
  shirtFit: string;
  shirtCollar: string;
  shirtCuff: string;
  height: string;
  weight: string;
  jacketSize: string;
  waistSize: string;
  neckSize: string;
  sleeveLength: string;
  hasTapeMeasure: YesNo;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  referredBy: string;
  promoCode: string;
};

// Each step is identified by a stable `key`. The list of steps is built
// dynamically from the selected product type, so conditional steps (e.g. the
// trouser cut, only for a full suit) slot in cleanly without index juggling.
export type StepKey =
  | "occasion" | "type" | "jacket" | "jacketCut" | "closure" | "jacketButtons" | "lining" | "lapel" | "monogram"
  | "color" | "contact" | "trouserCut" | "waistband" | "trouserButtons" | "pleats" | "hem"
  | "shirtColor" | "shirtFit" | "shirtCollar" | "shirtCuff" | "shirtMonogram"
  | "sizing" | "recap" | "payment" | "summary";

// Display labels (French default + per-locale via Configurator.stepLabels /
// Configurator.phases) live in the messages catalogs, resolved in StepBar —
// this file only carries step/phase structure, no text, so it needs no
// translator param and no locale awareness of its own.
export type StepDef = { key: StepKey };

// Groups the (up to 19) individual steps into a handful of named phases for
// the progress bar — showing "étape 1/19" at the very start reads as long
// and discouraging even though each step itself takes seconds. A phase not
// present in the current buildSteps() output (e.g. "Pantalon" on the blazer
// or trousers-only paths) is simply skipped by StepBar.
export const PHASES: { id: string; keys: StepKey[] }[] = [
  { id: "piece", keys: ["occasion", "type", "color", "shirtColor", "contact"] },
  { id: "veste", keys: ["jacket", "jacketCut", "closure", "jacketButtons", "lining", "lapel", "monogram"] },
  { id: "pantalon", keys: ["trouserCut", "waistband", "trouserButtons", "pleats", "hem"] },
  { id: "chemise", keys: ["shirtFit", "shirtCollar", "shirtCuff", "shirtMonogram"] },
  { id: "mesures", keys: ["sizing"] },
  { id: "reservation", keys: ["recap", "summary", "payment"] },
];

export function buildSteps(type: string): StepDef[] {
  if (type === "shirt") {
    return [
      { key: "occasion" }, { key: "type" }, { key: "shirtColor" }, { key: "contact" },
      { key: "shirtFit" }, { key: "shirtCollar" }, { key: "shirtCuff" }, { key: "shirtMonogram" },
      { key: "sizing" }, { key: "recap" }, { key: "summary" }, { key: "payment" },
    ];
  }
  if (type === "trousers") {
    return [
      { key: "occasion" }, { key: "type" }, { key: "color" }, { key: "contact" },
      { key: "trouserCut" }, { key: "waistband" }, { key: "trouserButtons" }, { key: "pleats" }, { key: "hem" },
      { key: "sizing" }, { key: "recap" }, { key: "summary" }, { key: "payment" },
    ];
  }
  const steps: StepDef[] = [
    { key: "occasion" }, { key: "type" }, { key: "color" }, { key: "contact" },
    { key: "jacket" }, { key: "jacketCut" }, { key: "closure" }, { key: "jacketButtons" },
    { key: "lining" }, { key: "lapel" }, { key: "monogram" },
  ];
  // A full two-piece suit also configures its trousers.
  if (type === "suit") {
    steps.push({ key: "trouserCut" });
    steps.push({ key: "waistband" });
    steps.push({ key: "trouserButtons" });
    steps.push({ key: "pleats" });
    steps.push({ key: "hem" });
  }
  steps.push({ key: "sizing" }, { key: "recap" }, { key: "summary" }, { key: "payment" });
  return steps;
}
