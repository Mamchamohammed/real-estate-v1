"use client";

import { useSyncExternalStore } from "react";
import { availableImages, seedProperties, type PropertyRecord, type PropertyType } from "./listings";

const storageKey = "fennex-properties-v1";
const changeEvent = "fennex-properties-changed";

const textField = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max + 1) : "";

const integerField = (value: unknown, min: number, max: number) =>
  typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;

export function parseProperty(value: unknown): PropertyRecord {
  if (!value || typeof value !== "object") throw new Error("Invalid property data");
  const input = value as Record<string, unknown>;
  const descriptions = input.descriptions as Record<string, unknown> | undefined;
  const property: PropertyRecord = {
    slug: textField(input.slug, 80), name: textField(input.name, 120),
    nameAr: textField(input.nameAr, 120), place: textField(input.place, 120),
    placeAr: textField(input.placeAr, 120), type: input.type as PropertyType,
    beds: input.beds as number, baths: input.baths as number,
    area: input.area as number, priceDzd: input.priceDzd as number,
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

export function loadProperties(): PropertyRecord[] {
  const raw = window.localStorage.getItem(storageKey);
  if (raw === null) return seedProperties;
  const stored: unknown = JSON.parse(raw);
  if (!Array.isArray(stored)) throw new Error("Property store is invalid");
  const properties = stored.map(parseProperty);
  if (new Set(properties.map((item) => item.slug)).size !== properties.length) throw new Error("Duplicate property URL slug");
  return properties;
}

export function saveProperties(properties: PropertyRecord[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(properties));
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeProperties(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changeEvent, listener);
  };
}

let lastRaw: string | null | undefined;
let lastProperties: PropertyRecord[] = seedProperties;

function getSnapshot() {
  const raw = window.localStorage.getItem(storageKey);
  if (raw !== lastRaw) {
    lastProperties = loadProperties();
    lastRaw = raw;
  }
  return lastProperties;
}

export function useProperties() {
  return useSyncExternalStore(subscribeProperties, getSnapshot, () => seedProperties);
}
