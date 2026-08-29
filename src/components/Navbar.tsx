"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import LangSwitcher from "./LangSwitcher";
import OffersDropdown from "./OffersDropdown";

export default function Navbar() {
  const t = useTranslations("Nav");
  const tCategories = useTranslations("Categories");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Mirrors OffersDropdown's own list — only needed again here for the
  // mobile menu's flat layout (no dropdown-in-dropdown on a burger menu).
  const products = [
    { label: tCategories("suit.label"), href: "/customize?type=suit" },
    { label: tCategories("blazer.label"), href: "/customize?type=blazer" },
    { label: tCategories("trousers.label"), href: "/customize?type=trousers" },
    { label: tCategories("shirt.label"), href: "/customize?type=shirt" },
  ];
  const giftOffer = { label: "The SLY Experience", href: "/experience" };

  const links = [
    { label: t("howItWorks"), href: "/#process" },
    { label: t("ourPromise"), href: "/#promise" },
    { label: t("ourStory"), href: "/notre-histoire" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 bg-white ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-[70px] flex items-center justify-between gap-8">

        {/* Left: nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-6 flex-1">
          <OffersDropdown align="left" />
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] tracking-wide text-muted hover:text-ink transition-colors whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Center: brand wordmark */}
        <Link
          href="/"
          className="font-brand text-[22px] md:text-[26px] tracking-[0.18em] uppercase text-ink shrink-0"
        >
          SLY Atelier
        </Link>

        {/* Right: language switcher + CTA (desktop) */}
        <div className="hidden lg:flex items-center flex-1 justify-end gap-6">
          <LangSwitcher />
          <Link
            href="/customize"
            className="px-5 py-2.5 text-[13px] tracking-wide bg-choco text-white hover:bg-ink transition-colors"
          >
            {t("configureCta")}
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          aria-label={t("menu")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden flex flex-col gap-[5px] p-2"
        >
          <span className={`block h-px w-5 bg-ink transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`block h-px w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-5 bg-ink transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-white px-6 py-6 flex flex-col gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">{t("offers")}</p>
            <div className="flex flex-col gap-4">
              {products.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setOpen(false)}
                  className="text-sm tracking-wide text-ink"
                >
                  {p.label}
                </Link>
              ))}
              <NextLink
                href={giftOffer.href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-wide text-choco"
              >
                {giftOffer.label}
              </NextLink>
            </div>
          </div>

          <div className="pt-1 border-t border-border flex flex-col gap-5 pt-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-wide text-ink"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <LangSwitcher className="mt-1" />
          <Link
            href="/customize"
            onClick={() => setOpen(false)}
            className="mt-2 px-5 py-3 text-center text-[13px] tracking-wide bg-choco text-white"
          >
            {t("configureCta")}
          </Link>
        </div>
      )}
    </header>
  );
}
