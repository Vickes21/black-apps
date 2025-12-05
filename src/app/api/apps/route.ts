import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/drizzle';
import { apps } from '@/lib/drizzle/schemas/apps';
import { createAppSchema } from '@/schemas/app-schema';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createAppSchema.parse(body);

    // Verifica se o domínio customizado já está em uso
    if (validatedData.customDomain) {
      const existingApp = await db.query.apps.findFirst({
        where: (apps, { eq }) => eq(apps.customDomain, validatedData.customDomain!),
      });

      if (existingApp) {
        return NextResponse.json(
          { error: 'Este domínio já está em uso' },
          { status: 409 }
        );
      }
    }

    const newApp = await db
      .insert(apps)
      .values({
        userId,
        name: validatedData.name,
        embbedUrl: validatedData.embbedUrl,
        imageUrl: validatedData.imageUrl,
        customDomain: validatedData.customDomain || null,
      })
      .returning();

    return NextResponse.json(newApp[0], { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao criar app' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const userApps = await db.query.apps.findMany({
      where: (apps, { eq }) => eq(apps.userId, userId),
      orderBy: (apps, { desc }) => [desc(apps.createdAt)],
    });

    return NextResponse.json(userApps);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar apps' },
      { status: 500 }
    );
  }
}
