"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { LanguageSwitcher } from "../chrome";
import { type Locale } from "../../i18n";
import { availableImages, formatDzd, listingName, listingPlace, photo, type PropertyRecord, type PropertyType } from "../../listings";
import { adminMessages } from "./admin-messages";

type Mode = "checking" | "setup" | "login" | "ready";

const blankProperty = (): PropertyRecord => ({
  slug: "", name: "", nameAr: "", place: "", placeAr: "", type: "sale",
  beds: 1, baths: 1, area: 1, priceDzd: 1, image: 1,
  descriptions: { en: "", fr: "", ar: "" },
});

export default function AdminClient({ lang }: { lang: Locale }) {
  const t = adminMessages[lang];
  const [mode, setMode] = useState<Mode>("checking");
  const [password, setPassword] = useState("");
  const [developmentPassword, setDevelopmentPassword] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState("");
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [draft, setDraft] = useState<PropertyRecord | null>(null);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const session = await fetch("/api/admin/session", { cache: "no-store" });
        const data = await session.json();
        if (!active) return;
        setDevelopmentPassword(data.developmentPassword);
        if (data.developmentPassword) setPassword(data.developmentPassword);
        if (!data.configured || !data.storageConfigured) {
          setSetupMessage(!data.configured ? `${t.authSetup}${!data.storageConfigured ? ` ${t.storageSetup}` : ""}` : t.storageSetup);
          setMode("setup"); return;
        }
        if (!data.authenticated) { setMode("login"); return; }
        const response = await fetch("/api/admin/properties", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const result = await response.json();
        if (active) { setProperties(result.properties); setMode("ready"); }
      } catch {
        if (active) { setError(t.loadError); setMode("login"); }
      }
    }
    void initialize();
    return () => { active = false; };
  }, [t.authSetup, t.loadError, t.storageSetup]);

  async function refreshProperties() {
    const response = await fetch("/api/admin/properties", { cache: "no-store" });
    if (!response.ok) throw new Error(t.loadError);
    const data = await response.json();
    setProperties(data.properties);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error();
      setPassword("");
      await refreshProperties();
      setMode("ready");
    } catch { setError(t.loginError); }
    finally { setBusy(false); }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setProperties([]); setDraft(null); setMode("login"); setNotice(""); setPassword(developmentPassword ?? "");
  }

  function updateDraft<K extends keyof PropertyRecord>(key: K, value: PropertyRecord[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  async function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(editSlug ? `/api/admin/properties/${encodeURIComponent(editSlug)}` : "/api/admin/properties", {
        method: editSlug ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.saveError);
      await refreshProperties();
      setDraft(null); setEditSlug(null); setNotice(t.saved);
    } catch (cause) { setError(`${t.saveError} ${(cause as Error).message}`); }
    finally { setBusy(false); }
  }

  async function removeProperty(slug: string) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/properties/${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      await refreshProperties();
      setDeleteSlug(null); setNotice(t.deleted);
    } catch { setError(t.deleteError); }
    finally { setBusy(false); }
  }

  return <div className="admin-shell">
    <header className="admin-header"><div className="admin-header-inner">
      <Link href={`/${lang}`} aria-label="Fennex"><Image src="/images/fennex-logo.png" alt="Fennex" width={1254} height={1254} priority /></Link>
      <div className="admin-header-actions"><LanguageSwitcher lang={lang} /><Link href={`/${lang}`}>{t.viewSite}</Link>{mode === "ready" && <button onClick={signOut}>{t.signOut}</button>}</div>
    </div></header>
    <main className="admin-main">
      {mode === "checking" && <div className="admin-card admin-loading" />}
      {mode === "setup" && <div className="admin-card admin-login"><span className="admin-eyebrow">{t.panel}</span><h1>{t.title}</h1><p>{setupMessage}</p></div>}
      {mode === "login" && <div className="admin-card admin-login">
        <span className="admin-eyebrow">{t.panel}</span><h1>{t.title}</h1><p>{t.loginIntro}</p>
        {developmentPassword && <p className="admin-dev-password">{t.localPassword}: <code>{developmentPassword}</code></p>}
        <form onSubmit={signIn}><label>{t.password}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label><button type="submit" disabled={busy}>{t.signIn}</button></form>
      </div>}
      {mode === "ready" && <>
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
            {deleteSlug === item.slug && <div className="admin-delete-confirm"><span>{t.confirmDelete}</span><button onClick={() => void removeProperty(item.slug)} disabled={busy}>{t.confirm}</button><button onClick={() => setDeleteSlug(null)}>{t.cancel}</button></div>}
          </article>)}
        </div>}
      </>}
      {error && <p className="admin-alert" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}
    </main>
  </div>;
}
