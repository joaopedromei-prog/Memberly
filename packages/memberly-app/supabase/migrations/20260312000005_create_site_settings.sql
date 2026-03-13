-- Story 8.1: Site Settings (key-value store)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read settings"
  ON public.site_settings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update settings"
  ON public.site_settings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can insert settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.is_admin());

-- Seed defaults
INSERT INTO public.site_settings (key, value) VALUES
  ('platform_name', '"Memberly"'),
  ('primary_color', '"#3B82F6"'),
  ('logo_url', 'null'),
  ('webhook_secret', to_jsonb(gen_random_uuid()::text)),
  ('welcome_email_template', '"Olá {{name}}, bem-vindo ao curso {{product}}!"');
