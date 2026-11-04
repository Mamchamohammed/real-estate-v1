import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { io } from "next/cache";
import { Suspense } from "react";
import { Footer, Header } from "../../chrome";
import { getMessages, isLocale, locales } from "../../../i18n";
import { formatDzd, listingName, listingPlace, listings, photo } from "../../../listings";
import { readProperties } from "../../../property-store";

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
  await io();
  const item = (await readProperties({ fallbackOnInvalid: true })).find((listing) => listing.slug === slug);
  if (!item) notFound();
  const t = getMessages(lang);
  return <>
    <Header lang={lang} />
    <main className="container detail-page">
      <Link className="back-link" href={`/${lang}#property`}>← {t.allProperties}</Link>
      <div className="detail-hero"><Image src={photo(item.image)} alt={`${t.exterior} ${listingName(item, lang)}`} width={1200} height={800} /><span>{t.types[item.type]}</span></div>
      <p className="image-note">{t.photoNote}</p>
      <div className="detail-grid"><div>
        <h1>{listingName(item, lang)}</h1><p className="detail-place">● &nbsp;{listingPlace(item, lang)}</p>
        <div className="detail-facts"><div><strong>{item.beds}</strong><span>{t.beds}</span></div><div><strong>{item.baths}</strong><span>{t.baths}</span></div><div><strong>{item.area.toLocaleString(lang)}</strong><span>{t.area}</span></div></div>
        <section><h2>{t.overview}</h2><p>{item.descriptions[lang]}</p></section>
        <section><h2>{t.features}</h2><ul>{t.featuresList.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>
        <section><h2>{t.amenities}</h2><div className="amenities">{t.amenitiesList.map((amenity) => <span key={amenity}>{amenity}</span>)}</div></section>
      </div><aside><span className="detail-type">{t.property} · {t.types[item.type]}</span><strong dir="ltr">{formatDzd(item.priceDzd)}</strong><p>{t.requestIntro}</p><Link href={`/${lang}#contact`}>{t.request} ↗</Link></aside></div>
    </main>
    <Footer lang={lang} />
  </>;
}
