import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { normalizeInternalPath, withQuery } from '@/lib/paths';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = normalizeInternalPath(searchParams.get('next'), '/portal');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}${withQuery('/login', {
      error: 'Could not authenticate',
      next: next !== '/portal' ? next : undefined,
    })}`,
  );
}
