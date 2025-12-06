import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { apps } from "@/lib/drizzle/schemas/apps";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        { error: "Domain parameter is required" },
        { status: 400 }
      );
    }

    // Busca app pelo domínio customizado
    const app = await db.query.apps.findFirst({
      where: eq(apps.customDomain, domain),
      columns: {
        id: true,
        name: true,
        customDomain: true,
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      appId: app.id,
      appName: app.name,
      domain: app.customDomain,
    });
  } catch (error) {
    console.error("Error fetching domain:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
