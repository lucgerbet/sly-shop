import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CARDS, getCard, fullName } from "@/lib/cards";
import CardExchange from "./CardExchange";
import "./carte.css";

export function generateStaticParams() {
  return Object.keys(CARDS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) return { robots: { index: false, follow: false } };
  return {
    title: `${fullName(card)} — ${card.company}`,
    // Handed over in person, never meant to be found in a search engine.
    robots: { index: false, follow: false },
  };
}

export default async function CartePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) notFound();

  return (
    <main className="carte">
      <div className="carte__inner">
        <p className="carte__brand">{card.company}</p>
        <h1 className="carte__name">{fullName(card)}</h1>
        <p className="carte__role">{card.role}</p>
        <p className="carte__tagline">{card.tagline}</p>
        <div className="carte__rule" />
        <CardExchange card={card} />
      </div>
    </main>
  );
}
