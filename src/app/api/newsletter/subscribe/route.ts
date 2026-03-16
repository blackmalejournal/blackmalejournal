import { NextResponse } from 'next/server';
import { z } from 'zod';
import { subscribeToNewsletter } from '@/lib/supabase/queries';

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = subscribeSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Validation failed';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { email, source } = result.data;

  try {
    await subscribeToNewsletter(email, source ?? 'website');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[newsletter/subscribe]', err);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }
}
