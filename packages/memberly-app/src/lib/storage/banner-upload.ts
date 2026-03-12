import { createAdminClient } from '@/lib/supabase/admin';

export async function uploadBannerFromBase64(
  base64Data: string,
  path: string,
  mimeType: string = 'image/png'
): Promise<string> {
  const adminClient = createAdminClient();
  const buffer = Buffer.from(base64Data, 'base64');

  const { data, error } = await adminClient.storage
    .from('banners')
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Falha no upload do banner: ${error.message}`);
  }

  const { data: urlData } = adminClient.storage
    .from('banners')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
