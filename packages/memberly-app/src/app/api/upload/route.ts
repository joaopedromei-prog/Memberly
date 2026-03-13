import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { requireAdmin } from '@/lib/utils/auth-guard';
import type { NextRequest } from 'next/server';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PDF_TYPES = ['application/pdf'];
const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const PDF_MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ATTACHMENT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

interface BucketConfig {
  bucket: string;
  allowedTypes: string[] | null; // null = any type
  maxSize: number;
  typeErrorMessage: string;
  sizeErrorMessage: string;
}

const BUCKET_CONFIGS: Record<string, BucketConfig> = {
  banners: {
    bucket: 'banners',
    allowedTypes: IMAGE_TYPES,
    maxSize: IMAGE_MAX_SIZE,
    typeErrorMessage: 'File must be JPEG, PNG, or WebP',
    sizeErrorMessage: 'File must be under 5MB',
  },
  pdfs: {
    bucket: 'pdfs',
    allowedTypes: PDF_TYPES,
    maxSize: PDF_MAX_SIZE,
    typeErrorMessage: 'File must be a PDF',
    sizeErrorMessage: 'File must be under 20MB',
  },
  attachments: {
    bucket: 'attachments',
    allowedTypes: null,
    maxSize: ATTACHMENT_MAX_SIZE,
    typeErrorMessage: '',
    sizeErrorMessage: 'File must be under 50MB',
  },
};

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const supabase = auth.data.supabase;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError('INVALID_FORM', 'Request must be multipart/form-data', 400);
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return apiError('VALIDATION_ERROR', 'File is required', 400);
  }

  const bucketName = (formData.get('bucket') as string) || 'banners';
  const config = BUCKET_CONFIGS[bucketName];

  if (!config) {
    return apiError('VALIDATION_ERROR', `Invalid bucket: ${bucketName}`, 400);
  }

  if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
    return apiError('INVALID_FILE_TYPE', config.typeErrorMessage, 400);
  }

  if (file.size > config.maxSize) {
    return apiError('FILE_TOO_LARGE', config.sizeErrorMessage, 400);
  }

  const ext = file.name.split('.').pop() ?? 'bin';
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(config.bucket)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return apiError('UPLOAD_ERROR', error.message, 500);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(config.bucket).getPublicUrl(data.path);

  return apiSuccess({ url: publicUrl }, 201);
}
