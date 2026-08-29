"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";

// Everything sold, in one dropdown: the four configurator pieces plus the
// gift offer. Shared between Navbar (marketing pages) and the configurator's
// own minimal header — kept as one component so the two never drift apart,
// and so it stays reachable even mid-configuration, not just from the
// homepage. The pieces stay inside [locale] (locale-aware Link, reusing
// Categories' own labels so this list can never say something different
// than the homepage cards do); "The SLY Experience" lives outside [locale]
// entirely (French-only, see src/app/experience) so it needs plain
// next/link — the locale-prefixing Link would send an /en or /it visitor to
// a route that 404s.
export default function OffersDropdown({ className = "", align = "left" }: { className?: string; align?: "left" | "right" }) {
  const t = useTranslations("Nav");
  const tCategories = useTranslations("Categories");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const products = [
    { label: tCategories("suit.label"), sub: tCategories("suit.sub"), href: "/customize?type=suit" },
    { label: tCategories("blazer.label"), sub: tCategories("blazer.sub"), href: "/customize?type=blazer" },
    { label: tCategories("trousers.label"), sub: tCategories("trousers.sub"), href: "/customize?type=trousers" },
    { label: tCategories("shirt.label"), sub: tCategories("shirt.sub"), href: "/customize?type=shirt" },
  ];
  const giftOffer = { label: "The SLY Experience", sub: "Carte cadeau", href: "/experience" };

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 text-[13px] tracking-wide text-muted hover:text-ink transition-colors whitespace-nowrap"
      >
        {t("offers")}
        <svg viewBox="0 0 12 12" className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className={`absolute top-full mt-3 w-64 bg-white border border-border shadow-sm z-50 ${align === "right" ? "right-0" : "left-0"}`}>
          {products.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              onClick={() => setOpen(false)}
              className="block px-5 py-3.5 hover:bg-offwhite transition-colors border-b border-border"
            >
              <span className="block text-sm text-ink font-medium">{p.label}</span>
              <span className="block text-xs text-muted font-light mt-0.5">{p.sub}</span>
            </Link>
          ))}
          <NextLink
            href={giftOffer.href}
            onClick={() => setOpen(false)}
            className="block px-5 py-3.5 hover:bg-offwhite transition-colors"
          >
            <span className="block text-sm text-choco font-medium">{giftOffer.label}</span>
            <span className="block text-xs text-muted font-light mt-0.5">{giftOffer.sub}</span>
          </NextLink>
        </div>
      )}
    </div>
  );
}
