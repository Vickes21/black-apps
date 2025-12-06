import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/drizzle';
import { domains } from '@/lib/drizzle/schemas';
import { CloudflareService } from '@/lib/cloudflare';
import { createDomainSchema } from '@/schemas/domain-schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userDomains = await db.query.domains.findMany({
      where: eq(domains.userId, userId),
      orderBy: (domains, { desc }) => [desc(domains.createdAt)],
    });

    return NextResponse.json(userDomains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createDomainSchema.parse(body);

    const cloudflare = new CloudflareService();
    const cloudflareData = await cloudflare.createCustomHostname(validatedData.hostname);

    const [newDomain] = await db.insert(domains).values({
      userId,
      hostname: validatedData.hostname,
      cloudflareId: cloudflareData.cloudflareId,
      status: cloudflareData.status,
      sslStatus: cloudflareData.sslStatus,
      verificationErrors: cloudflareData.verificationErrors,
      ownershipVerification: cloudflareData.ownershipVerification,
      ownershipVerificationHttp: cloudflareData.ownershipVerificationHttp,
      verifiedAt: cloudflareData.verifiedAt,
    }).onConflictDoUpdate({
      target: domains.hostname,
      set: {
        status: cloudflareData.status,
        sslStatus: cloudflareData.sslStatus,
        verificationErrors: cloudflareData.verificationErrors,
        ownershipVerification: cloudflareData.ownershipVerification,
        ownershipVerificationHttp: cloudflareData.ownershipVerificationHttp,
        verifiedAt: cloudflareData.verifiedAt,
        updatedAt: new Date(),
      },
    }).returning();

    return NextResponse.json(newDomain, { status: 201 });
  } catch (error) {
    console.error('Error creating domain:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create domain' },
      { status: 500 }
    );
  }
}
