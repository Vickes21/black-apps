import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/drizzle";
import { apps } from "@/lib/drizzle/schemas/apps";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { customDomain } = body;

    // Valida formato do domínio
    if (customDomain) {
      const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
      if (!domainRegex.test(customDomain)) {
        return NextResponse.json(
          { error: "Formato de domínio inválido" },
          { status: 400 }
        );
      }

      // Verifica se domínio já está em uso
      const existingApp = await db.query.apps.findFirst({
        where: and(
          eq(apps.customDomain, customDomain),
          // @ts-expect-error - Drizzle type issue
          eq(apps.id, id) === false
        ),
      });

      if (existingApp) {
        return NextResponse.json(
          { error: "Este domínio já está em uso" },
          { status: 409 }
        );
      }
    }

    // Atualiza o app
    const [updatedApp] = await db
      .update(apps)
      .set({
        customDomain: customDomain || null,
        updatedAt: new Date(),
      })
      .where(and(eq(apps.id, id), eq(apps.userId, userId)))
      .returning();

    if (!updatedApp) {
      return NextResponse.json(
        { error: "App não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      app: updatedApp,
    });
  } catch (error) {
    console.error("Error updating domain:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar domínio" },
      { status: 500 }
    );
  }
}
