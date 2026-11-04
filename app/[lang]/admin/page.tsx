import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale } from "../../i18n";
import AdminClient from "./admin-client";

export const metadata: Metadata = {
  title: "Property administration — Fennex",
  robots: { index: false, follow: false },
};

export default function AdminPage({ params }: PageProps<"/[lang]/admin">) {
  return <Suspense fallback={<main className="admin-shell" />}>
    <AdminContent params={params} />
  </Suspense>;
}

async function AdminContent({ params }: Pick<PageProps<"/[lang]/admin">, "params">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <AdminClient lang={lang} />;
}
