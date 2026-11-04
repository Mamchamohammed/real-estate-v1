"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { LanguageSwitcher } from "../chrome";
import { type Locale } from "../../i18n";
import { availableImages, formatDzd, listingName, listingPlace, photo, type PropertyRecord, type PropertyType } from "../../listings";
import { parseProperty, saveProperties, useProperties } from "../../property-local-store";
import { adminMessages } from "./admin-messages";

const blankProperty = (): PropertyRecord => ({
  slug: "", name: "", nameAr: "", place: "", placeAr: "", type: "sale",
  beds: 1, baths: 1, area: 1, priceDzd: 1, image: 1,
  descriptions: { en: "", fr: "", ar: "" },
});

export default function AdminClient({ lang }: { lang: Locale }) {
  const t = adminMessages[lang];
  const properties = useProperties();
  const [draft, setDraft] = useState<PropertyRecord | null>(null);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function updateDraft<K extends keyof PropertyRecord>(key: K, value: PropertyRecord[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const validated = parseProperty(draft);
      if (properties.some((item) => item.slug === validated.slug && item.slug !== editSlug)) throw new Error("URL slug already exists");
      saveProperties(editSlug
        ? properties.map((item) => item.slug === editSlug ? validated : item)
        : [...properties, validated]);
      setDraft(null); setEditSlug(null); setNotice(t.saved);
    } catch (cause) { setError(`${t.saveError} ${(cause as Error).message}`); }
    finally { setBusy(false); }
  }

  function removeProperty(slug: string) {
    setBusy(true); setError(""); setNotice("");
    try {
      saveProperties(properties.filter((item) => item.slug !== slug));
      setDeleteSlug(null); setNotice(t.deleted);
    } catch { setError(t.deleteError); }
    finally { setBusy(false); }
  }

  return <div className="admin-shell">
    <header className="admin-header"><div className="admin-header-inner">
      <Link href={`/${lang}`} aria-label="Fennex"><Image src="/images/fennex-logo.png" alt="Fennex" width={1254} height={1254} priority /></Link>
      <div className="admin-header-actions"><LanguageSwitcher lang={lang} /><Link href={`/${lang}`}>{t.viewSite}</Link></div>
    </div></header>
    <main className="admin-main">
      <>
        <div className="admin-intro"><div><span className="admin-eyebrow">{t.panel}</span><h1>{t.title}</h1><p>{t.subtitle}</p></div><button className="admin-primary" onClick={() => { setDraft(blankProperty()); setEditSlug(null); setError(""); setNotice(""); }}>{t.add}</button></div>
        <div className="admin-count">{t.propertyCount}: <strong>{properties.length}</strong></div>
        {draft ? <form className="admin-card admin-form" onSubmit={saveProperty}>
          <div className="admin-form-header"><h2>{editSlug ? t.editTitle : t.createTitle}</h2><button type="button" onClick={() => { setDraft(null); setError(""); }}>{t.cancel}</button></div>
          <div className="admin-fields">
            <label>{t.name}<input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} maxLength={120} required /></label>
            <label>{t.nameAr}<input value={draft.nameAr} onChange={(event) => updateDraft("nameAr", event.target.value)} maxLength={120} dir="rtl" required /></label>
            <label>{t.slug}<input value={draft.slug} onChange={(event) => updateDraft("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} pattern="[a-z0-9]+(-[a-z0-9]+)*" disabled={Boolean(editSlug)} maxLength={80} required /></label>
            <label>{t.type}<select value={draft.type} onChange={(event) => updateDraft("type", event.target.value as PropertyType)}><option value="sale">{t.sale}</option><option value="rent">{t.rent}</option><option value="investment">{t.investment}</option></select></label>
            <label>{t.place}<input value={draft.place} onChange={(event) => updateDraft("place", event.target.value)} maxLength={120} required /></label>
            <label>{t.placeAr}<input value={draft.placeAr} onChange={(event) => updateDraft("placeAr", event.target.value)} maxLength={120} dir="rtl" required /></label>
            <label>{t.beds}<input type="number" min="0" max="100" value={draft.beds} onChange={(event) => updateDraft("beds", Number(event.target.value))} required /></label>
            <label>{t.baths}<input type="number" min="0" max="100" value={draft.baths} onChange={(event) => updateDraft("baths", Number(event.target.value))} required /></label>
            <label>{t.area}<input type="number" min="1" value={draft.area} onChange={(event) => updateDraft("area", Number(event.target.value))} required /></label>
            <label>{t.price}<input type="number" min="1" value={draft.priceDzd} onChange={(event) => updateDraft("priceDzd", Number(event.target.value))} required /></label>
            <label>{t.image}<select value={draft.image} onChange={(event) => updateDraft("image", Number(event.target.value))}>{availableImages.map((image) => <option key={image} value={image}>{String(image).padStart(2, "0")}</option>)}</select><small>{t.imageHint}</small></label>
            <div className="admin-image-preview"><Image src={photo(draft.image)} alt="" width={400} height={260} /></div>
          </div>
          <div className="admin-description-fields">
            {(["en", "fr", "ar"] as const).map((locale) => <label key={locale}>{t[`description${locale[0].toUpperCase()}${locale.slice(1)}`]}<textarea value={draft.descriptions[locale]} onChange={(event) => setDraft((current) => current ? { ...current, descriptions: { ...current.descriptions, [locale]: event.target.value } } : current)} dir={locale === "ar" ? "rtl" : "ltr"} maxLength={3000} rows={4} required /></label>)}
          </div>
          <div className="admin-form-actions"><button type="submit" className="admin-primary" disabled={busy}>{busy ? t.saving : t.save}</button><button type="button" onClick={() => setDraft(null)}>{t.cancel}</button></div>
        </form> : <div className="admin-list">
          {properties.length === 0 && <p className="admin-card">{t.empty}</p>}
          {properties.map((item) => <article className="admin-property" key={item.slug}>
            <Image src={photo(item.image)} alt="" width={220} height={145} />
            <div className="admin-property-info"><span>{t[item.type]}</span><h2>{listingName(item, lang)}</h2><p>{listingPlace(item, lang)}</p><strong dir="ltr">{formatDzd(item.priceDzd)}</strong></div>
            <div className="admin-property-actions"><Link href={`/${lang}/properties/${item.slug}`}>{t.view}</Link><button onClick={() => { setDraft({ ...item, descriptions: { ...item.descriptions } }); setEditSlug(item.slug); setError(""); setNotice(""); }}>{t.edit}</button><button onClick={() => setDeleteSlug(item.slug)}>{t.delete}</button></div>
            {deleteSlug === item.slug && <div className="admin-delete-confirm"><span>{t.confirmDelete}</span><button onClick={() => removeProperty(item.slug)} disabled={busy}>{t.confirm}</button><button onClick={() => setDeleteSlug(null)}>{t.cancel}</button></div>}
          </article>)}
        </div>}
      </>
      {error && <p className="admin-alert" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}
    </main>
  </div>;
}
