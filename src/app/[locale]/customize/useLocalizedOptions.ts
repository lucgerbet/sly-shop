"use client";

import { useLocale, useTranslations } from "next-intl";
import { COLOR_FAMILIES } from "./data";

// data.ts stays the single source of truth for French text plus all
// technical fields (photo, hex, swatchHex, widthLabel, price). For French
// (the default locale) these hooks just return the base arrays untouched —
// no translation lookup, no duplicate data read. For English/Italian, each
// item's label/sub/detail is overridden from messages/{locale}.json under
// Configurator.options.<namespace>.<id>, keeping data.ts free of per-locale
// branching.
type LocalizableOption = {
  id: string;
  label: string;
  sub?: string;
  detail?: string;
  [key: string]: unknown;
};

export function useLocalizedOptions<T extends LocalizableOption>(namespace: string, base: T[]): T[] {
  const locale = useLocale();
  const t = useTranslations(`Configurator.options.${namespace}`);
  if (locale === "fr") return base;
  return base.map((item) => {
    const next = { ...item, label: t(`${item.id}.label`) };
    if (item.sub !== undefined) next.sub = t(`${item.id}.sub`);
    if (item.detail !== undefined) next.detail = t(`${item.id}.detail`);
    return next;
  });
}

// MONOGRAM_COLORS is a flat { id, label, hex } list with no sub/detail and a
// non-nested translation shape (Configurator.options.monogramColors.<id> is
// a plain string, not an object) — simple enough for its own small hook
// rather than forcing it through the generic one above.
export function useLocalizedMonogramColors<T extends { id: string; label: string }>(base: T[]): T[] {
  const locale = useLocale();
  const t = useTranslations("Configurator.options.monogramColors");
  if (locale === "fr") return base;
  return base.map((item) => ({ ...item, label: t(item.id) }));
}

// COLOR_FAMILIES nests a `shades` array per family — doesn't fit the flat
// shape above, so it gets its own hook.
export function useLocalizedColorFamilies() {
  const locale = useLocale();
  const t = useTranslations("Configurator.options.colorFamilies");
  if (locale === "fr") return COLOR_FAMILIES;
  return COLOR_FAMILIES.map((family) => ({
    ...family,
    label: t(`${family.id}.label`),
    shades: family.shades.map((shade) => ({ ...shade, label: t(`${family.id}.shades.${shade.id}`) })),
  }));
}
