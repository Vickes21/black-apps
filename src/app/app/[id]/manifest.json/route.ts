import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const app = await db.query.apps.findFirst({
      where: (apps, { eq }) => eq(apps.id, id),
    });

    if (!app) {
      return NextResponse.json(
        { error: "App não encontrado" },
        { status: 404 }
      );
    }

    const manifest = {
      name: app.name,
      short_name: app.name,
      description: `${app.name}`,
      start_url: `/app/${id}`,
      display: "standalone",
      background_color: "#000000",
      theme_color: "#000000",
      orientation: "any",
      icons: [
        {
          src: app.imageUrl,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: app.imageUrl,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
      categories: ["productivity", "utilities"],
      scope: `/app/${id}`,
    };

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar manifest:", error);
    return NextResponse.json(
      { error: "Erro ao gerar manifest" },
      { status: 500 }
    );
  }
}
