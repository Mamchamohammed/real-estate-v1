import { redirect } from "next/navigation";
import { listings } from "../../../listings";

export function generateStaticParams() {
  return listings.map(({ slug }) => ({ slug }));
}

export default async function LegacyPropertyPage({ params }: PageProps<"/properties/[slug]">) {
  const { slug } = await params;
  redirect(`/ar/properties/${slug}`);
}
