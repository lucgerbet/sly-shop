import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.notreHistoire" });
  return { title: t("title"), description: t("description") };
}

export default async function NotreHistoire({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("NotreHistoire");

  return (
    <>
      <Navbar />
      <main className="pt-[70px]">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-20 md:py-28">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cherry font-medium mb-6">
            {t("eyebrow")}
          </p>

          <h1 className="font-brand text-2xl md:text-3xl text-ink leading-snug italic mb-12">
            {t("quote")}
          </h1>

          <div className="flex flex-col gap-6 text-base md:text-lg text-muted leading-relaxed font-light">
            <p>{t("paragraph1")}</p>
            <p>{t("paragraph2")}</p>
            <p>{t("paragraph3")}</p>
            <p>{t("paragraph4")}</p>
            <p className="text-ink font-normal">{t("paragraph5")}</p>
          </div>

          <div className="mt-14">
            <Link
              href="/customize"
              className="inline-flex items-center gap-3 text-sm tracking-wide text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors"
            >
              {t("cta")}
              <span>→</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
