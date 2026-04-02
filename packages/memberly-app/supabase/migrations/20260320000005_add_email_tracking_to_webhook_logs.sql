-- Add email tracking columns to webhook_logs
ALTER TABLE webhook_logs
  ADD COLUMN email_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN email_error TEXT;
