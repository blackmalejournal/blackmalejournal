import { NextResponse } from 'next/server';
import { searchContent } from '@/lib/supabase/queries';

export async function GET(request: Request) {
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
