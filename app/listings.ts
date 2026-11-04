import type { Locale } from "./i18n";

export const listings = [
  { slug: "the-one", name: "The One", place: "Bel Air, LA", type: "investment", beds: 6, baths: 4, area: 2780, priceDzd: 93647000, image: 1 },
  { slug: "billionaire-mansion", name: "Billionaire Mansion", place: "Bel Air, LA", type: "sale", beds: 5, baths: 4, area: 3800, priceDzd: 67860000, image: 6 },
  { slug: "the-beverly-house", name: "The Beverly House", place: "Beverly Hills, CA", type: "rent", beds: 3, baths: 2, area: 1500, priceDzd: 39359000, image: 7 },
  { slug: "palazzo-di-amore", name: "Palazzo di Amore", place: "Beverly Hills, CA", type: "rent", beds: 4, baths: 2, area: 2100, priceDzd: 66503000, image: 8 },
  { slug: "the-manor", name: "The Manor", place: "Holmby Hills, LA", type: "investment", beds: 7, baths: 5, area: 3100, priceDzd: 65417000, image: 6 },
  { slug: "the-penthouse-at-central-park-tower", name: "The Penthouse at Central Park Tower", place: "Upper East Side, NY", type: "sale", beds: 2, baths: 2, area: 2200, priceDzd: 40445000, image: 1 },
] as const;

// Illustrative prices: USD amounts converted at about 135.72 DZD per USD
// (Bank of Algeria, 3 November 2026) and rounded to the nearest 1,000 DZD.
export const formatDzd = (amount: number) =>
  `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(amount)} DZD`;

export const descriptions: Record<Locale, Record<(typeof listings)[number]["slug"], string>> = {
  en: {
    "the-one": "Introducing The One, a striking 6-bedroom residence designed for both luxury living and smart investment. Located in the prestigious neighborhood of Bel Air, Los Angeles, this 2,780 sq.ft home features bold modern architecture, open-plan interiors, and refined finishes. With 4 bathrooms, spacious living areas, and curated landscaping, it’s a statement of comfort, style, and long-term value.",
    "billionaire-mansion": "A contemporary Bel Air mansion with expansive glass walls, generous living spaces, and a serene outdoor pool. Thoughtfully designed for refined everyday living and effortless entertaining.",
    "the-beverly-house": "Discover modern comfort in Beverly Hills. This elegant residence brings together open interiors, natural light, and a private pool in a sought-after neighborhood.",
    "palazzo-di-amore": "Palazzo di Amore offers a calm retreat with bold architecture, considered interiors, and seamless access to the outdoors in the heart of Beverly Hills.",
    "the-manor": "Set in Holmby Hills, The Manor pairs generous living spaces with beautiful views and a striking poolside terrace. An exceptional choice for luxury living and investment.",
    "the-penthouse-at-central-park-tower": "An exceptional residence with contemporary finishes and generous spaces, ideally located near Central Park and the cultural heart of New York City.",
  },
  fr: {
    "the-one": "The One est une remarquable résidence de six chambres, pensée pour un cadre de vie luxueux et un investissement de qualité. Située dans le prestigieux quartier de Bel Air à Los Angeles, cette maison de 2 780 pi² associe architecture contemporaine, espaces ouverts et finitions raffinées. Ses quatre salles de bain, ses vastes pièces à vivre et ses jardins soignés allient confort, élégance et valeur durable.",
    "billionaire-mansion": "Cette demeure contemporaine de Bel Air séduit par ses grandes baies vitrées, ses espaces généreux et sa piscine extérieure paisible. Elle a été conçue pour une vie quotidienne raffinée et des réceptions sans effort.",
    "the-beverly-house": "Découvrez le confort moderne à Beverly Hills. Cette élégante résidence réunit des espaces ouverts, une belle lumière naturelle et une piscine privée dans un quartier recherché.",
    "palazzo-di-amore": "Au cœur de Beverly Hills, Palazzo di Amore offre un refuge paisible, une architecture affirmée, des intérieurs soignés et un accès fluide aux espaces extérieurs.",
    "the-manor": "À Holmby Hills, The Manor associe de vastes espaces de vie, de belles vues et une superbe terrasse au bord de la piscine. Un choix d’exception pour habiter ou investir.",
    "the-penthouse-at-central-park-tower": "Une résidence d’exception aux finitions contemporaines et aux volumes généreux, idéalement située près de Central Park et du cœur culturel de New York.",
  },
  ar: {
    "the-one": "ذا وان منزل مميز يضم ست غرف نوم، صُمم للعيش الفاخر والاستثمار الواعد. يقع في حي بيل إير الراقي في لوس أنجلوس، وتبلغ مساحته 2,780 قدماً مربعاً. يتميز بعمارة عصرية جريئة ومساحات داخلية مفتوحة وتشطيبات راقية. ومع أربع حمّامات ومساحات معيشة واسعة وحدائق منسقة، يجمع بين الراحة والأناقة والقيمة طويلة الأمد.",
    "billionaire-mansion": "قصر عصري في بيل إير يتميز بواجهات زجاجية واسعة ومساحات معيشة رحبة ومسبح خارجي هادئ. صُمم لحياة يومية راقية واستقبال الضيوف براحة.",
    "the-beverly-house": "اكتشف الراحة العصرية في بيفرلي هيلز. يجمع هذا المنزل الأنيق بين المساحات المفتوحة والإضاءة الطبيعية ومسبح خاص في حي مرغوب.",
    "palazzo-di-amore": "يوفر بالاتسو دي أموري ملاذاً هادئاً في قلب بيفرلي هيلز، مع عمارة جريئة وتصميم داخلي مدروس واتصال سلس بالمساحات الخارجية.",
    "the-manor": "في هولمبي هيلز، يجمع ذا مانور بين مساحات معيشة واسعة وإطلالات جميلة وتراس رائع بجانب المسبح. خيار استثنائي للسكن الفاخر والاستثمار.",
    "the-penthouse-at-central-park-tower": "مسكن استثنائي بتشطيبات عصرية ومساحات رحبة، يتمتع بموقع مثالي قرب سنترال بارك والقلب الثقافي لمدينة نيويورك.",
  },
};

export const photo = (image: number) => `/images/ref-${String(image).padStart(2, "0")}.jpg`;

const arabicNames: Record<(typeof listings)[number]["slug"], string> = {
  "the-one": "ذا وان",
  "billionaire-mansion": "قصر الملياردير",
  "the-beverly-house": "منزل بيفرلي",
  "palazzo-di-amore": "بالاتسو دي أموري",
  "the-manor": "ذا مانور",
  "the-penthouse-at-central-park-tower": "بنتهاوس برج سنترال بارك",
};

const arabicPlaces: Record<(typeof listings)[number]["place"], string> = {
  "Bel Air, LA": "بيل إير، لوس أنجلوس",
  "Beverly Hills, CA": "بيفرلي هيلز، كاليفورنيا",
  "Holmby Hills, LA": "هولمبي هيلز، لوس أنجلوس",
  "Upper East Side, NY": "أبر إيست سايد، نيويورك",
};

export type PropertyType = "investment" | "sale" | "rent";

export type PropertyRecord = {
  slug: string;
  name: string;
  nameAr: string;
  place: string;
  placeAr: string;
  type: PropertyType;
  beds: number;
  baths: number;
  area: number;
  priceDzd: number;
  image: number;
  descriptions: Record<Locale, string>;
};

export const availableImages = [1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;

export const seedProperties: PropertyRecord[] = listings.map((item) => ({
  ...item,
  nameAr: arabicNames[item.slug],
  placeAr: arabicPlaces[item.place],
  descriptions: {
    en: descriptions.en[item.slug],
    fr: descriptions.fr[item.slug],
    ar: descriptions.ar[item.slug],
  },
}));

export function listingName(item: PropertyRecord, lang: Locale) {
  return lang === "ar" ? item.nameAr : item.name;
}

export function listingPlace(item: PropertyRecord, lang: Locale) {
  return lang === "ar" ? item.placeAr : item.place;
}
