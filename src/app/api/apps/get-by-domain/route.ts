import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { apps, domains } from '@/lib/drizzle/schemas';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostname = searchParams.get('hostname');

    if (!hostname) {
      return NextResponse.json(
        { error: 'Hostname is required' },
        { status: 400 }
      );
    }

    const domain = await db.query.domains.findFirst({
      where: eq(domains.hostname, hostname),
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    if (!domain.appId) {
      return NextResponse.json(
        { error: 'No app linked to this domain' },
        { status: 404 }
      );
    }

    const app = await db.query.apps.findFirst({
      where: eq(apps.id, domain.appId),
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error('Error fetching app by domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app' },
      { status: 500 }
    );
  }
}
