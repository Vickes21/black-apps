import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/drizzle';
import { domains, apps } from '@/lib/drizzle/schemas';
import { linkDomainSchema } from '@/schemas/domain-schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = linkDomainSchema.parse(body);

    const domain = await db.query.domains.findFirst({
      where: and(
        eq(domains.id, id),
        eq(domains.userId, userId)
      ),
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    if (validatedData.appId) {
      const app = await db.query.apps.findFirst({
        where: and(
          eq(apps.id, validatedData.appId),
          eq(apps.userId, userId)
        ),
      });

      if (!app) {
        return NextResponse.json({ error: 'App not found' }, { status: 404 });
      }
    }

    const [updatedDomain] = await db
      .update(domains)
      .set({
        appId: validatedData.appId,
      })
      .where(eq(domains.id, id))
      .returning();

    return NextResponse.json(updatedDomain);
  } catch (error) {
    console.error('Error linking domain:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to link domain' },
      { status: 500 }
    );
  }
}
