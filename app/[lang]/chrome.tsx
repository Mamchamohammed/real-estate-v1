"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getMessages, locales, type Locale } from "../i18n";

function Logo({ lang }: { lang: Locale }) {
  return <Link href={`/${lang}#hero`} className="logo" aria-label={`Omar Immobilier — ${getMessages(lang).home}`}>
    <Image className="logo-icon" src="/images/omar-logo.png" alt="Omar Immobilier" width={1254} height={1254} priority />
  </Link>;
}

export function LanguageSwitcher({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const t = getMessages(lang);
  const suffix = pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, "");
  return <nav className="language-switcher" aria-label={t.language}>
    {locales.map((locale) => <Link key={locale} href={`/${locale}${suffix}`} hrefLang={locale} lang={locale} aria-current={lang === locale ? "page" : undefined}>
      {locale.toUpperCase()}
    </Link>)}
  </nav>;
}

export function Header({ lang }: { lang: Locale }) {
  const t = getMessages(lang);
  const [menu, setMenu] = useState(false);
  return <header className="header"><div className="nav-wrap">
    <Logo lang={lang} />
    <nav className={menu ? "nav open" : "nav"} aria-label={t.navigation}>
      {[[t.home, "#hero"], [t.properties, "#property"], [t.contact, "#contact"]].map(([label, anchor]) =>
        <Link key={anchor} href={`/${lang}${anchor}`} onClick={() => setMenu(false)}>{label}</Link>)}
    </nav>
    <div className="header-actions">
      <LanguageSwitcher lang={lang} />
      <Link className="nav-cta" href={`/${lang}#contact`}><span className="dot" />{t.contactNow}<span className="round-arrow">↗</span></Link>
      <button className="mobile-menu" aria-label={t.toggleMenu} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? "✕" : "☰"}</button>
    </div>
  </div></header>;
}

export function Footer({ lang }: { lang: Locale }) {
  const t = getMessages(lang);
  return <footer><div className="container footer-inner">
    <div><Logo lang={lang} /><a href="tel:+12025550147" dir="ltr">+1 (202) 555-0147</a><a href="mailto:hello@example.com" dir="ltr">hello@example.com</a><p>{t.address}</p><small>{t.footerNote}</small></div>
    <div className="footer-right"><p>© {2026} {t.copyright}</p></div>
  </div></footer>;
}
