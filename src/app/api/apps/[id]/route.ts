import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/drizzle';
import { apps } from '@/lib/drizzle/schemas/apps';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verifica se o app existe e pertence ao usuário
    const existingApps = await db
      .select()
      .from(apps)
      // @ts-expect-error - Drizzle type conflict due to multiple versions
      .where(eq(apps.id, id))
      .limit(1);

    if (existingApps.length === 0 || existingApps[0].userId !== userId) {
      return NextResponse.json(
        { error: 'App não encontrado' },
        { status: 404 }
      );
    }

    // Deleta o app
    // @ts-expect-error - Drizzle type conflict due to multiple versions
    await db.delete(apps).where(eq(apps.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao deletar app:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar app' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    const app = await db.query.apps.findFirst({
      where: (apps, { eq, and }) => 
        and(eq(apps.id, id), eq(apps.userId, userId)),
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(app);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar app' },
      { status: 500 }
    );
  }
}
