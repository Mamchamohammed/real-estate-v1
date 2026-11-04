"use client";

import Image from "next/image";
import Link from "next/link";
import { Footer, Header } from "../../chrome";
import { getMessages, type Locale } from "../../../i18n";
import { formatDzd, listingName, listingPlace, photo } from "../../../listings";
import { useProperties } from "../../../property-local-store";

export default function PropertyDetail({ lang, slug }: { lang: Locale; slug: string }) {
  const item = useProperties().find((listing) => listing.slug === slug);
  const t = getMessages(lang);
  if (!item) return <><Header lang={lang} /><main className="container detail-page"><Link className="back-link" href={`/${lang}#property`}>← {t.allProperties}</Link></main><Footer lang={lang} /></>;
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
