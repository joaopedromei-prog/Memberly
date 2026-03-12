import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MemberList } from '@/components/admin/MemberList';
import type { MemberWithAccessCount, ProductWithModuleCount } from '@/types/api';

interface MembersPageProps {
  searchParams: Promise<{ search?: string; product_id?: string; page?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  const page = Math.max(1, parseInt(params.page || '1'));
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let profileIdsWithAccess: string[] | null = null;
  if (params.product_id) {
    const { data: accessRows } = await supabase
      .from('member_access')
      .select('profile_id')
      .eq('product_id', params.product_id);

    profileIdsWithAccess = accessRows?.map((r) => r.profile_id) ?? [];
  }

  let query = supabase
    .from('profiles')
    .select('*, member_access(count)', { count: 'exact' })
    .eq('role', 'member')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.search) {
    query = query.ilike('full_name', `%${params.search}%`);
  }

  if (profileIdsWithAccess) {
    if (profileIdsWithAccess.length === 0) {
      return (
        <div>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Membros</h1>
          <MemberList
            members={[]}
            products={[]}
            total={0}
            page={page}
            limit={limit}
            initialSearch={params.search || ''}
            initialProductId={params.product_id || ''}
          />
        </div>
      );
    }
    query = query.in('id', profileIdsWithAccess);
  }

  const [{ data: members, count }, { data: products }] = await Promise.all([
    query,
    supabase.from('products').select('*').order('title'),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Membros</h1>
      <MemberList
        members={(members as MemberWithAccessCount[]) ?? []}
        products={(products as ProductWithModuleCount[]) ?? []}
        total={count ?? 0}
        page={page}
        limit={limit}
        initialSearch={params.search || ''}
        initialProductId={params.product_id || ''}
      />
    </div>
  );
}
