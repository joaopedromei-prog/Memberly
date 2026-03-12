CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway TEXT NOT NULL DEFAULT 'payt',
    event_type TEXT NOT NULL DEFAULT '',
    payload JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('processed', 'failed', 'ignored')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- Enable RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only service_role can insert webhook logs (called from edge functions / server-side)
CREATE POLICY "service_role_insert_webhook_logs"
  ON webhook_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service_role and admin users can read webhook logs
CREATE POLICY "service_role_select_webhook_logs"
  ON webhook_logs FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "admin_select_webhook_logs"
  ON webhook_logs FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
