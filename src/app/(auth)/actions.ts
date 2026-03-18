'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect('/portal');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message));
  }

  // Create member row linked to auth user
  if (data.user) {
    await supabase.from('members').insert({
      id: data.user.id,
      email,
      tier: 'free' as const,
      role: 'member' as const,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    });
  }

  revalidatePath('/', 'layout');
  redirect('/portal');
}

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: formData.get('email') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback`,
    },
  });

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message));
  }

  redirect('/login?message=Check your email for the magic link');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const displayName = formData.get('displayName') as string;

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  if (error) {
    redirect('/portal/settings?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect('/portal/settings?message=Profile updated');
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect('/portal/settings?error=' + encodeURIComponent(error.message));
  }

  redirect('/portal/settings?message=Password updated');
}
