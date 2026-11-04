import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const adminCookie = "omar_admin_session";
export const sessionSeconds = 12 * 60 * 60;

const password = process.env.ADMIN_PASSWORD;
const secret = process.env.ADMIN_SESSION_SECRET;

export const adminConfigured = () => Boolean(password && secret && secret.length >= 32);

export function passwordMatches(candidate: unknown) {
  if (!adminConfigured() || typeof candidate !== "string") return false;
  const received = createHash("sha256").update(candidate).digest();
  const expected = createHash("sha256").update(password!).digest();
  return timingSafeEqual(received, expected);
}

function signature(expiresAt: string) {
  return createHmac("sha256", secret!).update(expiresAt).digest("base64url");
}

export function createSession() {
  const expiresAt = String(Date.now() + sessionSeconds * 1000);
  return `${expiresAt}.${signature(expiresAt)}`;
}

export function validSession(token: string | undefined) {
  if (!adminConfigured() || !token) return false;
  const [expiresAt, received] = token.split(".");
  if (!/^[0-9]+$/.test(expiresAt) || !received) return false;
  const expiry = Number(expiresAt);
  if (!Number.isSafeInteger(expiry) || expiry < Date.now()) return false;
  const expected = signature(expiresAt);
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const isAdmin = (request: NextRequest) =>
  validSession(request.cookies.get(adminCookie)?.value);

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}
