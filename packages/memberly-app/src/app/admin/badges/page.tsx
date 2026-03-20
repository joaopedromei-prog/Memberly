import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { BadgeListClient } from '@/components/admin/BadgeListClient';

export default async function BadgesPage() {
  const supabase = await createServerSupabaseClient();

  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Badges</h1>
        <Link
          href="/admin/badges/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-admin-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-admin-primary-hover hover:shadow-md hover:shadow-blue-500/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo Badge
        </Link>
      </div>
      <BadgeListClient badges={badges ?? []} />
    </div>
  );
}
