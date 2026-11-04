import { notFound } from "next/navigation";
import { isLocale } from "../i18n";
import Home from "./home-client";

export default async function LocaleHome({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Home lang={lang} />;
}
