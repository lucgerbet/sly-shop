"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buildSummaryRows } from "../summary";
import { frConfiguratorT } from "../frTranslator";
import type { Config } from "../data";

function SuccessContent() {
  const t = useTranslations("Success");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "booking" | "done" | "error">("loading");
  const [amount, setAmount] = useState<number | null>(null);
  const [booked, setBooked] = useState(false);
  const fullName = (c: Config | null) => [c?.firstName, c?.lastName].filter(Boolean).join(" ");
  // Read once, lazily, during the initial render rather than in an effect —
  // it's a synchronous localStorage read (written by StepPayment before the
  // Stripe redirect), not a subscription to an external system that changes.
  const [config] = useState<Config | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("sly_config");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (!sessionId) return; // no session_id: render falls through to the error view below directly

    fetch(`/api/verify-session?session_id=${sessionId}`)
      .then((r) => r.json())
      .then(({ paid, amountTotal }) => {
        if (!paid) {
          setStatus("error");
          return;
        }
        setAmount(amountTotal);
        setStatus("booking");
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  useEffect(() => {
    if (status !== "booking" || booked) return;

    function onMessage(e: MessageEvent) {
      if (typeof e.data?.event !== "string" || e.data.event !== "calendly.event_scheduled" || booked) return;
      setBooked(true);

      const calendlyEventUri: string | undefined = e.data.payload?.event?.uri;

      // Same label-lookup logic as the on-screen summary the client saw —
      // guarantees this email never shows raw ids ("roma", "notch"...).
      // Always French — this is what the CRM/Luc sees, see frTranslator.ts.
      const rows: [string, string][] = config ? buildSummaryRows(config, frConfiguratorT) : [];

      fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          rows,
          name: fullName(config) || "Client",
          email: config?.email || "",
          message: config?.message || "",
        }),
      }).finally(() => {
        localStorage.removeItem("sly_config");
        setStatus("done");
      });

      // Best-effort — a failure here never blocks the confirmation screen
      // above; the booking already succeeded on Calendly's side regardless.
      // The CRM resolves the real start/end time itself via the Calendly
      // API using calendlyEventUri (event_scheduled never carries a date/time).
      if (sessionId) {
        fetch("/api/appointment-booked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stripeCheckoutSessionId: sessionId,
            calendlyEventUri,
          }),
        }).catch(() => {});
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [status, booked, amount, sessionId, config]);

  if (sessionId && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-sm text-muted font-light">{t("verifying")}</p>
      </div>
    );
  }

  if (!sessionId || status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-brand text-3xl text-ink mb-4">{t("notConfirmedTitle")}</h1>
          <p className="text-sm text-muted font-light leading-relaxed mb-8">
            {t("notConfirmedBody")}
          </p>
          <Link href="/" className="text-sm text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors">
            {t("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  if (status === "booking") {
    const email = config?.email || "";
    const name = fullName(config);
    const prefill = `${email ? `&email=${encodeURIComponent(email)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}`;
    const calendlyUrl = `https://calendly.com/gerbetluc2218/30min?hide_gdpr_banner=1&primary_color=3d2b1f${prefill}`;
    return (
      <div className="min-h-screen px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="w-10 h-10 bg-choco mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-base">✓</span>
            </div>
            <h1 className="font-brand text-3xl text-ink mb-2">
              {t("paidTitle", { amount: amount ? (amount / 100).toFixed(2) : "—" })}
            </h1>
            <p className="text-sm text-muted font-light">{t("bookingSubtitle")}</p>
          </div>
          <div className="mb-6 px-5 py-4 bg-offwhite text-sm text-ink font-light leading-relaxed">
            <strong className="font-medium">{t("prepareStrong")}</strong> {t("prepareRest")}
          </div>
          <div
            className="calendly-inline-widget w-full rounded-sm overflow-hidden border border-border"
            data-url={calendlyUrl}
            style={{ minWidth: "320px", height: "700px" }}
          />
          <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
          {/* A blocked/failed widget load (ad-blockers, network hiccups) would
              otherwise strand a client who already paid — this link always
              works regardless of the embed's state. */}
          <p className="text-xs text-muted font-light text-center mt-4">
            {t("widgetFallback")}{" "}
            <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="text-ink border-b border-ink hover:text-choco hover:border-choco transition-colors">
              {t("widgetFallbackLink")}
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 bg-choco mx-auto mb-8 flex items-center justify-center">
          <span className="text-white text-xl">✓</span>
        </div>
        <h1 className="font-brand text-3xl text-ink mb-4">{t("doneTitle")}</h1>
        <p className="text-sm text-muted font-light leading-relaxed mb-8">
          {t("doneBody")}
        </p>
        <Link href="/" className="text-sm text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors">
          {t("backHome")}
        </Link>

        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-xs text-muted font-light mb-3">
            {t("referralPrompt")}
          </p>
          <a
            href={`mailto:?subject=${encodeURIComponent(t("shareSubject"))}&body=${encodeURIComponent(t("shareBody"))}`}
            className="text-xs text-ink border-b border-ink pb-0.5 hover:text-choco hover:border-choco transition-colors"
          >
            {t("shareCta")}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Success() {
  const t = useTranslations("Success");
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-sm text-muted font-light">{t("loading")}</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
