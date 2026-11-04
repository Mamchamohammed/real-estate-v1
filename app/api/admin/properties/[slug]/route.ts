import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "../../../../admin-auth";
import { parseProperty, updateProperties } from "../../../../property-store";

const headers = { "Cache-Control": "no-store" };
const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });

export async function PUT(request: NextRequest, { params }: RouteContext<"/api/admin/properties/[slug]">) {
  if (!isAdmin(request)) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers });
  const { slug } = await params;
  let property;
  try { property = parseProperty(await request.json()); }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400, headers }); }
  if (property.slug !== slug) return NextResponse.json({ error: "Slug cannot be changed" }, { status: 400, headers });
  try {
    const found = await updateProperties((properties) => {
      const index = properties.findIndex((item) => item.slug === slug);
      if (index === -1) return false;
      properties[index] = property;
      return true;
    });
    return found
      ? NextResponse.json({ property }, { headers })
      : NextResponse.json({ error: "Property not found" }, { status: 404, headers });
  } catch {
    return NextResponse.json({ error: "Could not save property" }, { status: 500, headers });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext<"/api/admin/properties/[slug]">) {
  if (!isAdmin(request)) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers });
  const { slug } = await params;
  try {
    const found = await updateProperties((properties) => {
      const index = properties.findIndex((item) => item.slug === slug);
      if (index === -1) return false;
      properties.splice(index, 1);
      return true;
    });
    return found
      ? NextResponse.json({ deleted: slug }, { headers })
      : NextResponse.json({ error: "Property not found" }, { status: 404, headers });
  } catch {
    return NextResponse.json({ error: "Could not delete property" }, { status: 500, headers });
  }
}
