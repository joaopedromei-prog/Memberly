-- Expand welcome email from single template to subject + body + active toggle
INSERT INTO public.site_settings (key, value) VALUES
  ('welcome_email_active', 'true'),
  ('welcome_email_subject', '"Bem-vindo(a) ao {{product_name}}!"'),
  ('welcome_email_body', '"Olá {{member_name}},\n\nSeu acesso ao {{product_name}} foi liberado!\n\nAcesse agora: {{login_url}}\n\nQualquer dúvida, entre em contato.\n\nAbraço,\nEquipe {{platform_name}}"')
ON CONFLICT (key) DO NOTHING;
