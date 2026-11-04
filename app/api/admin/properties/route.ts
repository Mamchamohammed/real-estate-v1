import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "../../../admin-auth";
import { parseProperty, readProperties, updateProperties } from "../../../property-store";

const headers = { "Cache-Control": "no-store" };
const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  try {
    return NextResponse.json({ properties: await readProperties() }, { headers });
  } catch {
    return NextResponse.json({ error: "Could not load properties" }, { status: 500, headers });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers });
  let property;
  try { property = parseProperty(await request.json()); }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400, headers }); }
  try {
    await updateProperties((properties) => {
      if (properties.some((item) => item.slug === property.slug)) throw new Error("Slug already exists");
      properties.push(property);
    });
    return NextResponse.json({ property }, { status: 201, headers });
  } catch (error) {
    const duplicate = (error as Error).message === "Slug already exists";
    return NextResponse.json({ error: duplicate ? "Slug already exists" : "Could not save property" }, { status: duplicate ? 409 : 500, headers });
  }
}
