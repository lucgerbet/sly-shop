import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white px-6 md:px-10 py-12">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-brand text-xl tracking-[0.15em] uppercase text-ink mb-1">
            SLY Atelier
          </p>
          <p className="text-xs text-muted font-light">
            Costume sur mesure · En ligne · Livré en 2–3 semaines
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          {["Instagram", "Contact", "Mentions légales", "Politique de confidentialité"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-xs text-muted hover:text-ink transition-colors tracking-wide"
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-7xl mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4">
        <p className="text-xs text-muted/60 font-light">
          Les vêtements sur mesure sont confectionnés après validation de la commande. La production démarre après confirmation des mesures.
        </p>
        <p className="text-xs text-muted/60 font-light shrink-0">
          © {new Date().getFullYear()} SLY Atelier
        </p>
      </div>
    </footer>
  );
}
