import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  // Role-based redirect
  let userRole: string | undefined =
    (data.user.app_metadata as Record<string, unknown>)?.role as string | undefined;

  if (!userRole) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    userRole = profile?.role;
  }

  if (userRole === 'admin') {
    return NextResponse.redirect(new URL('/admin', origin));
  }

  return NextResponse.redirect(new URL('/', origin));
}
