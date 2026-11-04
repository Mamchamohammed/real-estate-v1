"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Footer, Header } from "./chrome";
import { getMessages, type Locale } from "../i18n";
import { formatDzd, listingName, listingPlace, photo, type PropertyRecord } from "../listings";

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="tag">{children}</span>;
}

export default function Home({ lang, properties }: { lang: Locale; properties: PropertyRecord[] }) {
  const t = getMessages(lang);
  const [sent, setSent] = useState(false);
  return (
    <>
      <Header lang={lang} />
      <main className="home-main">
        <section
          id="hero"
          className="hero container"
          style={{
            backgroundImage: `linear-gradient(0deg,rgba(1,8,18,.56),transparent 45%),linear-gradient(90deg,rgba(1,8,18,.28),rgba(1,8,18,.04)),url(${photo(1)})`,
          }}
        >
          <div className="hero-content">
            <h1>
              {t.heroLines.map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h1>
            <p>{t.heroDescription}</p>
            <Link href={`/${lang}#property`} className="hero-cta">
              {t.explore} <span>↗</span>
            </Link>
            <div className="hero-stats">
              <div>
                <strong>
                  200<sup>+</sup>
                </strong>
                <small>{t.projects}</small>
              </div>
              <div>
                <strong dir="ltr">
                  1.36B DZD<sup>+</sup>
                </strong>
                <small>{t.value}</small>
              </div>
            </div>
          </div>
        </section>
        <section id="property" className="container section properties">
          <Tag>{t.featured}</Tag>
          <h2>
            {t.featuredLines[0]}
            <br className="desktop" /> {t.featuredLines[1]}
          </h2>
          <p className="image-note">{t.photoNote}</p>
          <div className="property-grid">
            {properties.map((item) => (
              <Link
                className="property"
                key={item.slug}
                href={`/${lang}/properties/${item.slug}`}
              >
                <div className="property-photo">
                  <Image
                    src={photo(item.image)}
                    alt={`${t.exterior} ${listingName(item, lang)}`}
                    width={1200}
                    height={800}
                    sizes="(max-width: 440px) 100vw, (max-width: 700px) 50vw, 33vw"
                  />
                  <span>{t.types[item.type]}</span>
                </div>
                <p className="place">● &nbsp;{listingPlace(item, lang)}</p>
                <h3>{listingName(item, lang)}</h3>
                <div className="facts">
                  <span>▱ {item.beds}</span>
                  <span>♧ {item.baths}</span>
                  <span>
                    ↔ {item.area.toLocaleString(lang)} {t.area}
                  </span>
                </div>
                <strong dir="ltr">{formatDzd(item.priceDzd)}</strong>
              </Link>
            ))}
          </div>
        </section>
        <section
          id="contact"
          className="contact"
          style={{
            backgroundImage: `linear-gradient(#030914 0%,rgba(3,9,20,.9) 45%,rgba(3,9,20,.14) 80%),url(${photo(30)})`,
          }}
        >
          <div className="contact-inner">
            <Tag>{t.getInTouch}</Tag>
            <h2>
              {t.contactLines[0]}
              <br className="desktop" /> {t.contactLines[1]}
            </h2>
            <p>
              {t.contactIntro}{" "}
              <a href="mailto:hello@example.com" dir="ltr">
                hello@example.com
              </a>
              . {t.demoContact}
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <div className="form-grid">
                <input
                  name="firstName"
                  placeholder={t.firstName}
                  aria-label={t.firstName}
                  required
                />
                <input
                  name="lastName"
                  placeholder={t.lastName}
                  aria-label={t.lastName}
                  required
                />
                <input
                  name="email"
                  placeholder={t.email}
                  aria-label={t.email}
                  type="email"
                  dir="ltr"
                  required
                />
                <input
                  name="phone"
                  placeholder={t.phone}
                  aria-label={t.phone}
                  type="tel"
                  dir="ltr"
                  required
                />
              </div>
              <textarea
                name="message"
                placeholder={t.message}
                aria-label={t.message}
                rows={3}
                required
              />
              <button type="submit">{sent ? t.received : t.send}</button>
              {sent && (
                <p className="form-note" role="status">
                  {t.formNote}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
