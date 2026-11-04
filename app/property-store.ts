import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { availableImages, seedProperties, type PropertyRecord, type PropertyType } from "./listings";

const dataDirectory = join(process.cwd(), "data");
const dataFile = join(dataDirectory, "properties.json");

const textField = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max + 1) : "";

const integerField = (value: unknown, min: number, max: number) =>
  typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;

export function parseProperty(value: unknown): PropertyRecord {
  if (!value || typeof value !== "object") throw new Error("Invalid property data");
  const input = value as Record<string, unknown>;
  const descriptions = input.descriptions as Record<string, unknown> | undefined;
  const property: PropertyRecord = {
    slug: textField(input.slug, 80),
    name: textField(input.name, 120),
    nameAr: textField(input.nameAr, 120),
    place: textField(input.place, 120),
    placeAr: textField(input.placeAr, 120),
    type: input.type as PropertyType,
    beds: input.beds as number,
    baths: input.baths as number,
    area: input.area as number,
    priceDzd: input.priceDzd as number,
    image: input.image as number,
    descriptions: {
      en: textField(descriptions?.en, 3000),
      fr: textField(descriptions?.fr, 3000),
      ar: textField(descriptions?.ar, 3000),
    },
  };

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(property.slug)) throw new Error("Use a lowercase URL slug with hyphens");
  if ([property.name, property.nameAr, property.place, property.placeAr].some((field) => !field || field.length > 120)) throw new Error("Complete all names and locations");
  if (!["investment", "sale", "rent"].includes(property.type)) throw new Error("Invalid property type");
  if (!integerField(property.beds, 0, 100) || !integerField(property.baths, 0, 100)) throw new Error("Invalid room count");
  if (!integerField(property.area, 1, 10000000) || !integerField(property.priceDzd, 1, 1000000000000)) throw new Error("Invalid area or price");
  if (!availableImages.includes(property.image as (typeof availableImages)[number])) throw new Error("Choose an available image");
  if (Object.values(property.descriptions).some((field) => !field || field.length > 3000)) throw new Error("Complete all descriptions");
  return property;
}

let lastGoodProperties: PropertyRecord[] | undefined;

export async function readProperties({ fallbackOnInvalid = false }: { fallbackOnInvalid?: boolean } = {}): Promise<PropertyRecord[]> {
  try {
    const stored = JSON.parse(await readFile(dataFile, "utf8")) as unknown;
    if (!Array.isArray(stored)) throw new Error("Property store is invalid");
    const properties = stored.map(parseProperty);
    lastGoodProperties = properties;
    return properties;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return seedProperties;
    if (fallbackOnInvalid && error instanceof Error && !(error as NodeJS.ErrnoException).code) {
      console.error("Property store contains invalid JSON or property data; using the last valid listings for this request.", error);
      return lastGoodProperties ?? seedProperties;
    }
    throw error;
  }
}

let writeQueue: Promise<void> = Promise.resolve();

export function updateProperties<T>(change: (properties: PropertyRecord[]) => T | Promise<T>): Promise<T> {
  const operation = writeQueue.then(async () => {
    const properties = await readProperties();
    const result = await change(properties);
    await mkdir(dataDirectory, { recursive: true });
    const temporaryFile = `${dataFile}.${randomUUID()}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(properties, null, 2)}\n`, "utf8");
    await rename(temporaryFile, dataFile);
    return result;
  });
  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}
