import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_MEMBER_PASSWORD } from '@/lib/constants/auth';

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
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const rows: ImportRow[] = body.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
  }

  const admin = createAdminClient();
  let created = 0;
  let existing = 0;
  const errors: ImportError[] = [];

  // Pre-fetch all users once and build email→id map (fixes N+1)
  const { data: allUsersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 10000 });
  const emailToUserId = new Map<string, string>();
  for (const u of allUsersData?.users ?? []) {
    if (u.email) emailToUserId.set(u.email.toLowerCase(), u.id);
  }

  // Pre-fetch all product slugs once
  const slugs = [...new Set(rows.map((r) => r.product_slug?.trim()).filter(Boolean))];
  const { data: productsData } = await admin
    .from('products')
    .select('id, slug')
    .in('slug', slugs);

  const slugToProductId = new Map<string, string>();
  for (const p of productsData ?? []) {
    slugToProductId.set(p.slug, p.id);
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = row.email?.trim().toLowerCase();
    const fullName = row.full_name?.trim();
    const productSlug = row.product_slug?.trim();

    if (!email || !fullName || !productSlug) {
      errors.push({ row: i + 1, email: email || '', reason: 'Campos obrigatórios faltando' });
      continue;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row: i + 1, email, reason: 'Email inválido' });
      continue;
    }

    const productId = slugToProductId.get(productSlug);
    if (!productId) {
      errors.push({ row: i + 1, email, reason: `Produto "${productSlug}" não encontrado` });
      continue;
    }

    try {
      let profileId: string;
      const existingUserId = emailToUserId.get(email);

      if (existingUserId) {
        profileId = existingUserId;
        existing++;
      } else {
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email,
          password: DEFAULT_MEMBER_PASSWORD,
          email_confirm: true,
        });

        if (createError || !newUser.user) {
          errors.push({ row: i + 1, email, reason: createError?.message || 'Erro ao criar usuário' });
          continue;
        }

        profileId = newUser.user.id;
        emailToUserId.set(email, profileId);

        await admin.from('profiles').upsert({
          id: profileId,
          full_name: fullName,
          role: 'member',
        });

        created++;
      }

      await admin.from('member_access').upsert(
        {
          profile_id: profileId,
          product_id: productId,
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
