import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  const member = await getMemberById(user.id);

  if (!member || (member.role !== 'admin' && member.role !== 'editor')) {
    redirect('/portal');
  }

  const displayName =
    (user.user_metadata?.display_name as string) || user.email || 'Admin';

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminNav displayName={displayName} role={member.role} />
      <div className="flex-1 bg-bmj-brown/30 p-8">{children}</div>
    </div>
  );
}
