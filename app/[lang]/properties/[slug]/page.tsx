import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale, locales } from "../../../i18n";
import { listings } from "../../../listings";
import PropertyDetail from "./property-detail";

export function generateStaticParams() {
  return locales.flatMap((lang) => listings.map(({ slug }) => ({ lang, slug })));
}

export default function PropertyPage({ params }: PageProps<"/[lang]/properties/[slug]">) {
  return <Suspense fallback={<><div className="header" /><main className="container detail-page"><div className="detail-hero detail-hero-loading" /></main></>}>
    <PropertyContent params={params} />
  </Suspense>;
}

async function PropertyContent({ params }: Pick<PageProps<"/[lang]/properties/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  return <PropertyDetail lang={lang} slug={slug} />;
}
