import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { availableImages, seedProperties, type PropertyRecord, type PropertyType } from "./listings";

const dataDirectory = join(process.cwd(), "data");
const dataFile = join(dataDirectory, "properties.json");
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;
const hostedWithoutDatabase = Boolean(process.env.VERCEL && !sql);
let initialization: Promise<void> | undefined;

export const storageConfigured = () => !hostedWithoutDatabase;

function ensureDatabase() {
  if (!sql) throw new Error("Database is not configured");
  initialization ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS fennex_property_store (
      id integer PRIMARY KEY,
      properties jsonb NOT NULL,
      version bigint NOT NULL DEFAULT 0
    )`;
    await sql`INSERT INTO fennex_property_store (id, properties)
      VALUES (1, ${JSON.stringify(seedProperties)}::jsonb)
      ON CONFLICT (id) DO NOTHING`;
  })().catch((error) => {
    initialization = undefined;
    throw error;
  });
  return initialization;
}

async function readDatabase() {
  if (!sql) throw new Error("Database is not configured");
  await ensureDatabase();
  const rows = await sql`SELECT properties, version FROM fennex_property_store WHERE id = 1`;
  const row = rows[0];
  const stored: unknown = typeof row?.properties === "string" ? JSON.parse(row.properties) : row?.properties;
  if (!Array.isArray(stored)) throw new Error("Property store is invalid");
  return { properties: stored.map(parseProperty), version: String(row.version) };
}

async function updateDatabase<T>(change: (properties: PropertyRecord[]) => T | Promise<T>): Promise<T> {
  if (!sql) throw new Error("Database is not configured");
  for (let attempt = 0; attempt < 5; attempt++) {
    const { properties, version } = await readDatabase();
    const result = await change(properties);
    const updated = await sql`UPDATE fennex_property_store
      SET properties = ${JSON.stringify(properties)}::jsonb, version = version + 1
      WHERE id = 1 AND version = ${version}::bigint RETURNING version`;
    if (updated.length) {
      lastGoodProperties = properties;
      return result;
    }
  }
  throw new Error("Property store changed during update; please retry");
}

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

async function readStoreText() {
  try {
    return await readFile(dataFile, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await mkdir(dataDirectory, { recursive: true });
    try {
      await writeFile(dataFile, `${JSON.stringify(seedProperties, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    } catch (createError) {
      if ((createError as NodeJS.ErrnoException).code !== "EEXIST") throw createError;
    }
    return readFile(dataFile, "utf8");
  }
}

export async function readProperties({ fallbackOnInvalid = false }: { fallbackOnInvalid?: boolean } = {}): Promise<PropertyRecord[]> {
  try {
    if (hostedWithoutDatabase) throw new Error("DATABASE_URL is required for property storage on Vercel");
    if (sql) {
      const { properties } = await readDatabase();
      lastGoodProperties = properties;
      return properties;
    }
    const stored = JSON.parse(await readStoreText()) as unknown;
    if (!Array.isArray(stored)) throw new Error("Property store is invalid");
    const properties = stored.map(parseProperty);
    lastGoodProperties = properties;
    return properties;
  } catch (error) {
    if (fallbackOnInvalid && (sql || hostedWithoutDatabase)) {
      console.error("Could not load database properties; showing the last valid listings.", error);
      return lastGoodProperties ?? seedProperties;
    }
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return seedProperties;
    if (fallbackOnInvalid && ["EACCES", "EPERM", "EROFS"].includes((error as NodeJS.ErrnoException).code ?? "")) {
      console.error("Property store is not writable on this server; showing the last valid listings.", error);
      return lastGoodProperties ?? seedProperties;
    }
    if (fallbackOnInvalid && error instanceof Error && !(error as NodeJS.ErrnoException).code) {
      console.error("Property store contains invalid JSON or property data; using the last valid listings for this request.", error);
      return lastGoodProperties ?? seedProperties;
    }
    throw error;
  }
}

let writeQueue: Promise<void> = Promise.resolve();

export function updateProperties<T>(change: (properties: PropertyRecord[]) => T | Promise<T>): Promise<T> {
  if (hostedWithoutDatabase) return Promise.reject(new Error("DATABASE_URL is required for property storage on Vercel"));
  if (sql) return updateDatabase(change);
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
