import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, adminCookie, createSession, developmentAdminPassword, isAdmin, passwordMatches, sameOrigin, sessionSeconds } from "../../../admin-auth";
import { storageConfigured } from "../../../property-store";

const noStore = { "Cache-Control": "no-store" };

export function GET(request: NextRequest) {
  return NextResponse.json({ configured: adminConfigured(), storageConfigured: storageConfigured(), authenticated: isAdmin(request), developmentPassword: developmentAdminPassword() }, { headers: noStore });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: noStore });
  if (!adminConfigured()) return NextResponse.json({ error: "Admin is not configured" }, { status: 503, headers: noStore });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore }); }
  if (!passwordMatches((input as { password?: unknown })?.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401, headers: noStore });
  }
  const response = NextResponse.json({ authenticated: true }, { headers: noStore });
  response.cookies.set(adminCookie, createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !["localhost", "127.0.0.1"].includes(request.nextUrl.hostname),
    sameSite: "strict",
    path: "/",
    maxAge: sessionSeconds,
  });
  return response;
}

export function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: noStore });
  const response = NextResponse.json({ authenticated: false }, { headers: noStore });
  response.cookies.set(adminCookie, "", { path: "/", maxAge: 0 });
  return response;
}
