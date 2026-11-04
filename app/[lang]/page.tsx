import { notFound } from "next/navigation";
import { io } from "next/cache";
import { Suspense } from "react";
import { isLocale } from "../i18n";
import { readProperties } from "../property-store";
import Home from "./home-client";

export default function LocaleHome({ params }: PageProps<"/[lang]">) {
  return <Suspense fallback={<><div className="header" /><main className="container home-loading" /></>}>
    <LocaleHomeContent params={params} />
  </Suspense>;
}

async function LocaleHomeContent({ params }: Pick<PageProps<"/[lang]">, "params">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await io();
  const properties = await readProperties();
  return <Home lang={lang} properties={properties} />;
}
