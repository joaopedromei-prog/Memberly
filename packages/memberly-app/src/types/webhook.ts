import { z } from 'zod';

// Payt V1 postback payload schema
// Docs: https://github.com/ventuinha/payt-postback
export const paytCustomerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  fake_email: z.boolean().optional(),
  doc: z.string().optional(),
  phone: z.string().optional(),
});

export const paytProductSchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  code: z.string().min(1),
  sku: z.string().optional(),
  type: z.string().optional(),
  quantity: z.number().optional(),
});

export const paytTransactionSchema = z.object({
  payment_method: z.string().optional(),
  payment_status: z.string().optional(),
  total_price: z.number().optional(),
  paid_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const paytSubscriptionSchema = z.object({
  code: z.string().optional(),
  plan_name: z.string().optional(),
  charges: z.number().optional(),
  periodicity: z.string().optional(),
  next_charge_at: z.string().optional(),
  status: z.string().optional(),
  started_at: z.string().optional(),
}).optional();

export const paytWebhookSchema = z.object({
  integration_key: z.string().min(1),
  transaction_id: z.string().min(1),
  seller_id: z.string().optional(),
  test: z.boolean().optional(),
  type: z.string().optional(),
  status: z.string().min(1),
  tangible: z.boolean().optional(),
  cart_recovered: z.boolean().optional(),
  cart_id: z.string().optional(),
  customer: paytCustomerSchema,
  product: paytProductSchema,
  transaction: paytTransactionSchema.optional(),
  subscription: paytSubscriptionSchema,
  commission: z.array(z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    type: z.string().optional(),
    amount: z.number().optional(),
  })).optional(),
});

export type PaytWebhookPayload = z.infer<typeof paytWebhookSchema>;

export interface WebhookLog {
  id: string;
  gateway: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: 'processed' | 'failed' | 'ignored';
  error_message: string | null;
  email_sent: boolean;
  email_error: string | null;
  created_at: string;
}

export interface ProductMapping {
  id: string;
  external_product_id: string;
  product_id: string;
  gateway: string;
  created_at: string;
}
