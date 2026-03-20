import { NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { checkProductCompletion } from '@/lib/certificates/completion-check';
import { generateCertificateHash } from '@/lib/certificates/hash';
import { generateCertificatePDF } from '@/lib/certificates/generate-pdf';
import { uploadCertificatePDF } from '@/lib/certificates/certificate-storage';

export async function POST(request: NextRequest) {
  // 1. Auth check
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user, supabase } = auth.data;

  // 2. Parse request body
  let body: { productId?: string };
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_BODY', 'Corpo da requisição inválido', 400);
  }

  const { productId } = body;
  if (!productId) {
    return apiError('MISSING_PRODUCT_ID', 'productId é obrigatório', 400);
  }

  // 3. Check member_access
  const { data: access } = await supabase
    .from('member_access')
    .select('id')
    .eq('profile_id', user.id)
    .eq('product_id', productId)
    .single();

  if (!access) {
    return apiError('FORBIDDEN', 'Você não tem acesso a este produto', 403);
  }

  // 3.5. Check if certificates are enabled for this product
  const { data: product } = await supabase
    .from('products')
    .select('certificate_enabled')
    .eq('id', productId)
    .single();

  if (!product?.certificate_enabled) {
    return apiError('CERTIFICATES_DISABLED', 'Certificados não estão habilitados para este produto', 400);
  }

  // 4. Check if certificate already exists (idempotency)
  const { data: existingCert } = await supabase
    .from('certificates')
    .select('id, hash, certificate_url, issued_at')
    .eq('profile_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existingCert) {
    return apiSuccess({ certificate: existingCert }, 200);
  }

  // 5. Check product completion
  const completion = await checkProductCompletion(supabase, user.id, productId);

  if (completion.totalLessons === 0) {
    return apiError('NO_LESSONS', 'Este produto não possui aulas publicadas', 400, {
      totalLessons: completion.totalLessons,
    });
  }

  if (!completion.completed) {
    return apiError('INCOMPLETE_PRODUCT', 'Você ainda não completou todas as aulas do produto', 400, {
      totalLessons: completion.totalLessons,
      completedLessons: completion.completedLessons,
    });
  }

  // 6. Get member profile and product title
  const [profileResult, productResult] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('products').select('title').eq('id', productId).single(),
  ]);

  if (!profileResult.data || !productResult.data) {
    return apiError('NOT_FOUND', 'Perfil ou produto não encontrado', 404);
  }

  const memberName = profileResult.data.full_name;
  const productTitle = productResult.data.title;

  // 7. Generate hash and PDF
  const hash = generateCertificateHash(user.id, productId);
  const issuedAt = new Date();
  const pdfBuffer = await generateCertificatePDF(memberName, productTitle, issuedAt, hash);

  // 8. Upload PDF to Storage
  const certificateUrl = await uploadCertificatePDF(pdfBuffer, user.id, productId);

  // 9. Insert certificate record
  const { data: certificate, error: insertError } = await supabase
    .from('certificates')
    .insert({
      profile_id: user.id,
      product_id: productId,
      certificate_url: certificateUrl,
      hash,
      issued_at: issuedAt.toISOString(),
    })
    .select('id, hash, certificate_url, issued_at')
    .single();

  if (insertError) {
    return apiError('INSERT_ERROR', `Falha ao salvar certificado: ${insertError.message}`, 500);
  }

  return apiSuccess({ certificate }, 201);
}
