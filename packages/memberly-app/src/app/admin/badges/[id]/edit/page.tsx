import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { BadgeForm } from '@/components/admin/BadgeForm';

interface EditBadgePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBadgePage({ params }: EditBadgePageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: badge, error } = await supabase
    .from('badges')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !badge) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Editar Badge</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <BadgeForm badge={badge} />
      </div>
    </div>
  );
}
