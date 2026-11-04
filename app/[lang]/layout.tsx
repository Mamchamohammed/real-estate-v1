import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { getMessages, isLocale, locales } from "../i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getMessages(lang);
  return { title: t.title, description: t.description };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}><body>{children}</body></html>;
}
