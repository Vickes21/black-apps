import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/drizzle';
import { domains } from '@/lib/drizzle/schemas';
import { CloudflareService } from '@/lib/cloudflare';
import { eq, and } from 'drizzle-orm';

export async function POST(
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

    if (!domain.cloudflareId) {
      return NextResponse.json(
        { error: 'Domain not registered with Cloudflare' },
        { status: 400 }
      );
    }

    const cloudflare = new CloudflareService();
    const verificationData = await cloudflare.verifyCustomHostname(domain.cloudflareId);

    const [updatedDomain] = await db
      .update(domains)
      .set({
        status: verificationData.status,
        sslStatus: verificationData.sslStatus,
        verificationErrors: verificationData.verificationErrors,
        ownershipVerification: verificationData.ownershipVerification,
        ownershipVerificationHttp: verificationData.ownershipVerificationHttp,
        verifiedAt: verificationData.verifiedAt,
      })
      .where(eq(domains.id, id))
      .returning();

    return NextResponse.json(updatedDomain);
  } catch (error) {
    console.error('Error verifying domain:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    );
  }
}
