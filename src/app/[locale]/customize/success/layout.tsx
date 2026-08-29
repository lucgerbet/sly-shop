import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.success" });
  return {
    title: t("title"),
    // Tied to a one-time Stripe session id — nothing here is meaningful to
    // index, and it shouldn't show up in search results.
    robots: { index: false, follow: false },
  };
}

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
