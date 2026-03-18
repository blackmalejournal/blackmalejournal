import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { searchContent } from '@/lib/supabase/queries';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

export async function GET(request: Request) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success } = limiter.check(30, ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters.' },
      { status: 400 },
    );
  }

  const results = await searchContent(query, { limit: 20 });
  return NextResponse.json({ results, query: query.trim() });
}
