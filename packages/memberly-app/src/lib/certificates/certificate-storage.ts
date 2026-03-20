import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Upload a certificate PDF to Supabase Storage.
 * Uses the admin client to bypass RLS.
 *
 * @param buffer - PDF file as Buffer
 * @param profileId - Member's profile ID
 * @param productId - Product ID
 * @returns Public URL of the uploaded certificate
 */
export async function uploadCertificatePDF(
  buffer: Buffer,
  profileId: string,
  productId: string
): Promise<string> {
  const adminClient = createAdminClient();
  const path = `${profileId}/${productId}.pdf`;

  const { data, error } = await adminClient.storage
    .from('certificates')
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw new Error(`Falha no upload do certificado: ${error.message}`);
  }

  const { data: urlData } = adminClient.storage
    .from('certificates')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
