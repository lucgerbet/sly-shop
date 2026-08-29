import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Process from "@/components/Process";
import LucSection from "@/components/LucSection";
import Promise from "@/components/Promise";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Process />
        <LucSection />
        <Promise />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
