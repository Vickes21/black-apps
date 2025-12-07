import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { apps } from '@/lib/drizzle/schemas';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('APP PUBLIC ID', id);

    const app = await db.query.apps.findFirst({
      where: eq(apps.id, id),
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error('Error fetching public app:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar app' },
      { status: 500 }
    );
  }
}
