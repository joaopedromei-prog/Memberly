import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch all members with their product access
  const { data: members } = await supabase
    .from('profiles')
    .select(`
      id, full_name, created_at,
      member_access (
        product:products ( title )
      )
    `)
    .eq('role', 'member')
    .order('created_at', { ascending: false });

  if (!members) {
    return new Response('', { status: 500 });
  }

  // Fetch emails from auth (we need supabase admin for this, but since we're
  // server-side with cookie auth, we'll use the user's email from auth.users
  // For simplicity, we'll just include profile data without email
  // In production, you'd use admin client to list users

  interface MemberRow {
    id: string;
    full_name: string;
    created_at: string;
    member_access: { product: { title: string } }[];
  }

  // Build CSV
  const header = 'full_name,created_at,produtos';
  const rows = (members as unknown as MemberRow[]).map((m) => {
    const name = escapeCsvField(m.full_name || '');
    const createdAt = new Date(m.created_at).toISOString().split('T')[0];
    const products = m.member_access
      .map((a) => a.product?.title)
      .filter(Boolean)
      .join('; ');
    return `${name},${createdAt},${escapeCsvField(products)}`;
  });

  const csv = [header, ...rows].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="membros-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
