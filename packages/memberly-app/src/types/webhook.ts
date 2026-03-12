import { z } from 'zod';

export const paytWebhookSchema = z.object({
  email: z.string().email(),
  product_id: z.string().min(1),
  transaction_id: z.string().min(1),
  status: z.string().min(1),
  customer_name: z.string().optional(),
});

export type PaytWebhookPayload = z.infer<typeof paytWebhookSchema>;

export interface WebhookLog {
  id: string;
  gateway: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: 'processed' | 'failed' | 'ignored';
  error_message: string | null;
  created_at: string;
}

export interface ProductMapping {
  id: string;
  external_product_id: string;
  product_id: string;
  gateway: string;
  created_at: string;
}
