"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const links = [
  { label: "Costume", href: "#categories" },
  { label: "Comment ça marche", href: "#process" },
  { label: "Notre promesse", href: "#promise" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        <nav className="hidden md:flex items-center gap-8 flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] tracking-wide text-muted hover:text-ink transition-colors"
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

        {/* Right: CTA (desktop) */}
        <div className="hidden md:flex items-center flex-1 justify-end">
          <Link
            href="/customize"
            className="px-5 py-2.5 text-[13px] tracking-wide bg-choco text-white hover:bg-ink transition-colors"
          >
            Configurer mon costume
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col gap-[5px] p-2"
        >
          <span className={`block h-px w-5 bg-ink transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`block h-px w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-5 bg-ink transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-6 py-6 flex flex-col gap-5">
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
          <Link
            href="/customize"
            onClick={() => setOpen(false)}
            className="mt-2 px-5 py-3 text-center text-[13px] tracking-wide bg-choco text-white"
          >
            Configurer mon costume
          </Link>
        </div>
      )}
    </header>
  );
}
