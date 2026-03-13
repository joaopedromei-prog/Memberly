import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface ImportRow {
  email: string;
  full_name: string;
  product_slug: string;
}

interface ImportError {
  row: number;
  email: string;
  reason: string;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Verify admin
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

  const body = await request.json();
  const rows: ImportRow[] = body.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
  }

  const admin = createAdminClient();
  let created = 0;
  let existing = 0;
  const errors: ImportError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = row.email?.trim().toLowerCase();
    const fullName = row.full_name?.trim();
    const productSlug = row.product_slug?.trim();

    if (!email || !fullName || !productSlug) {
      errors.push({ row: i + 1, email: email || '', reason: 'Campos obrigatórios faltando' });
      continue;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row: i + 1, email, reason: 'Email inválido' });
      continue;
    }

    // Look up product
    const { data: product } = await admin
      .from('products')
      .select('id')
      .eq('slug', productSlug)
      .maybeSingle();

    if (!product) {
      errors.push({ row: i + 1, email, reason: `Produto "${productSlug}" não encontrado` });
      continue;
    }

    try {
      // Check if user already exists
      const { data: existingUsers } = await admin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email?.toLowerCase() === email
      );

      let profileId: string;

      if (existingUser) {
        profileId = existingUser.id;
        existing++;
      } else {
        // Create new user
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email,
          password: crypto.randomUUID(),
          email_confirm: true,
        });

        if (createError || !newUser.user) {
          errors.push({ row: i + 1, email, reason: createError?.message || 'Erro ao criar usuário' });
          continue;
        }

        profileId = newUser.user.id;

        // Create profile
        await admin.from('profiles').upsert({
          id: profileId,
          full_name: fullName,
          role: 'member',
        });

        // Send password recovery email
        await admin.auth.admin.generateLink({
          type: 'recovery',
          email,
        });

        created++;
      }

      // Grant access (on conflict do nothing)
      await admin.from('member_access').upsert(
        {
          profile_id: profileId,
          product_id: product.id,
          granted_by: 'manual',
        },
        { onConflict: 'profile_id,product_id', ignoreDuplicates: true }
      );
    } catch (err) {
      errors.push({
        row: i + 1,
        email,
        reason: err instanceof Error ? err.message : 'Erro desconhecido',
      });
    }
  }

  return NextResponse.json({ created, existing, errors });
}
