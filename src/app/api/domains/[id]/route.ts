import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/drizzle';
import { domains } from '@/lib/drizzle/schemas';
import { CloudflareService } from '@/lib/cloudflare';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const domain = await db.query.domains.findFirst({
      where: and(
        eq(domains.id, id),
        eq(domains.userId, userId)
      ),
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Delete from Cloudflare if it has a cloudflareId
    if (domain.cloudflareId) {
      try {
        const cloudflare = new CloudflareService();
        await cloudflare.deleteCustomHostname(domain.cloudflareId);
      } catch (error) {
        console.error('Error deleting from Cloudflare:', error);
        // Continue with database deletion even if Cloudflare deletion fails
      }
    }

    // Delete from database
    await db.delete(domains).where(eq(domains.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting domain:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete domain' },
      { status: 500 }
    );
  }
}
