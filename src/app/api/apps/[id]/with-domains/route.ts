import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/drizzle';
import { apps, domains } from '@/lib/drizzle/schemas';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const app = await db.query.apps.findFirst({
      where: and(eq(apps.id, id), eq(apps.userId, userId)),
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App não encontrado' },
        { status: 404 }
      );
    }

    const userDomains = await db.query.domains.findMany({
      where: eq(domains.userId, userId),
      orderBy: (domains, { desc }) => [desc(domains.createdAt)],
    });

    return NextResponse.json({
      app,
      domains: userDomains,
    });
  } catch (error) {
    console.error('Error fetching app with domains:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar app' },
      { status: 500 }
    );
  }
}
