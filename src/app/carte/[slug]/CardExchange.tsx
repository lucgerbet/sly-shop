"use client";

import { useState } from "react";
import {
  CALENDLY_URL,
  CONFIGURATOR_SUIT_URL,
  PRIVACY_URL,
  isValidEmail,
  isValidPhone,
  type Card,
} from "@/lib/cards";

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "phone", string>>;

export default function CardExchange({ card }: { card: Card }) {
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  function set(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!values.firstName.trim()) next.firstName = "Prénom requis.";
    if (!values.lastName.trim()) next.lastName = "Nom requis.";
    if (!values.email.trim()) next.email = "Email requis.";
    else if (!isValidEmail(values.email)) next.email = "Cet email ne semble pas valide.";
    if (!values.phone.trim()) next.phone = "Téléphone requis.";
    else if (!isValidPhone(values.phone)) next.phone = "Ce numéro ne semble pas valide.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSending(true);
    try {
      const res = await fetch("/api/carte/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, slug: card.slug }),
      });
      if (res.status === 400) {
        setFormError("Une des informations saisies n'est pas valide.");
        return;
      }
      if (res.status === 429) {
        setFormError("Trop de tentatives. Réessayez dans quelques minutes.");
        return;
      }
      // Any other outcome — including the CRM being unreachable, which the
      // relay reports as ok:false rather than an error — still hands over the
      // contact. A face-to-face exchange must never hinge on our backend.
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div>
        {/* The name and role are already at the top of the page — repeating
            them here would just push the save button below the fold. */}
        <div className="carte__contact">
          <p className="carte__brand">Ma fiche contact</p>
          <p className="carte__contactLine">
            <a href={`mailto:${card.email}`}>{card.email}</a>
          </p>
          {card.phoneDisplay && (
            <p className="carte__contactLine">
              <a href={`tel:${card.phone}`}>{card.phoneDisplay}</a>
            </p>
          )}
        </div>

        <div className="carte__links">
          <a className="carte__button" href={`/api/vcard/${card.slug}`} download={`${card.slug}.vcf`}>
            Enregistrer mon contact
          </a>
          <a className="carte__button carte__button--ghost" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
            Prendre rendez-vous
          </a>
          <a className="carte__button carte__button--ghost" href={CONFIGURATOR_SUIT_URL}>
            Composer un costume
          </a>
        </div>

        <p className="carte__footnote">
          Merci — je vous recontacte très vite.
          <br />
          <a href={PRIVACY_URL}>Politique de confidentialité</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="carte__lead">Échangeons nos coordonnées</p>
      <p className="carte__hint">
        Laissez-moi vos coordonnées, et je vous transmets ma fiche contact dans la foulée.
      </p>

      <div className="carte__row">
        <div className="carte__field">
          <label className="carte__label" htmlFor="carte-firstName">Prénom</label>
          <input
            id="carte-firstName" className="carte__input" autoComplete="given-name"
            aria-invalid={!!errors.firstName} value={values.firstName}
            onChange={(e) => set("firstName", e.target.value)} placeholder="Jean"
          />
          {errors.firstName && <p className="carte__error">{errors.firstName}</p>}
        </div>
        <div className="carte__field">
          <label className="carte__label" htmlFor="carte-lastName">Nom</label>
          <input
            id="carte-lastName" className="carte__input" autoComplete="family-name"
            aria-invalid={!!errors.lastName} value={values.lastName}
            onChange={(e) => set("lastName", e.target.value)} placeholder="Dupont"
          />
          {errors.lastName && <p className="carte__error">{errors.lastName}</p>}
        </div>
      </div>

      <div className="carte__field">
        <label className="carte__label" htmlFor="carte-email">Email</label>
        <input
          id="carte-email" className="carte__input" type="email" inputMode="email" autoComplete="email"
          aria-invalid={!!errors.email} value={values.email}
          onChange={(e) => set("email", e.target.value)} placeholder="jean.dupont@exemple.fr"
        />
        {errors.email && <p className="carte__error">{errors.email}</p>}
      </div>

      <div className="carte__field">
        <label className="carte__label" htmlFor="carte-phone">Téléphone</label>
        <input
          id="carte-phone" className="carte__input" type="tel" inputMode="tel" autoComplete="tel"
          aria-invalid={!!errors.phone} value={values.phone}
          onChange={(e) => set("phone", e.target.value)} placeholder="06 12 34 56 78"
        />
        {errors.phone && <p className="carte__error">{errors.phone}</p>}
      </div>

      {formError && <p className="carte__error">{formError}</p>}

      <button className="carte__button" type="submit" disabled={sending}>
        {sending ? "Envoi…" : "Recevoir sa fiche contact"}
      </button>

      <p className="carte__footnote">
        Vos coordonnées servent uniquement à vous recontacter.
        <br />
        <a href={PRIVACY_URL}>Politique de confidentialité</a>
      </p>
    </form>
  );
}
