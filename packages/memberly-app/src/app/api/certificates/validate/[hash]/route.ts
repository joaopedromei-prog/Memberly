import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { apiSuccess } from '@/lib/utils/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  const supabase = createAdminClient();

  const { data: certificate } = await supabase
    .from('certificates')
    .select('id, hash, issued_at, certificate_url, profiles(full_name), products(title)')
    .eq('hash', hash)
    .maybeSingle();

  if (!certificate) {
    return apiSuccess({ valid: false });
  }

  const profiles = certificate.profiles as unknown as { full_name: string } | null;
  const products = certificate.products as unknown as { title: string } | null;

  return apiSuccess({
    valid: true,
    certificate: {
      memberName: profiles?.full_name ?? 'Membro',
      productTitle: products?.title ?? 'Produto',
      issuedAt: certificate.issued_at,
      certificateUrl: certificate.certificate_url,
    },
  });
}
