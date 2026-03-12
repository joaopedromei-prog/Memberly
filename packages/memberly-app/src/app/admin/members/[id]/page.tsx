import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MemberDetail } from '@/components/admin/MemberDetail';
import type { MemberAccessWithProduct } from '@/types/api';

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) notFound();

  const [{ data: access }, { data: allProducts }] = await Promise.all([
    supabase
      .from('member_access')
      .select('*, products(id, title, slug, banner_url)')
      .eq('profile_id', id)
      .order('granted_at', { ascending: false }),
    supabase.from('products').select('id, title').order('title'),
  ]);

  return (
    <MemberDetail
      profile={profile}
      access={(access as MemberAccessWithProduct[]) ?? []}
      allProducts={allProducts ?? []}
    />
  );
}
