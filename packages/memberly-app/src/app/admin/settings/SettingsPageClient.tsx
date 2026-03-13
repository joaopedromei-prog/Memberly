'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandingSettings } from '@/components/admin/BrandingSettings';
import { WebhookSettings } from '@/components/admin/WebhookSettings';
import { EmailSettings } from '@/components/admin/EmailSettings';

export interface WebhookLogEntry {
  id: string;
  status: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

interface SettingsPageClientProps {
  settings: Record<string, unknown>;
  webhookLogs: WebhookLogEntry[];
}

const tabs = [
  { id: 'branding' as const, label: 'Branding' },
  { id: 'webhooks' as const, label: 'Webhooks' },
  { id: 'email' as const, label: 'Email' },
];

type TabId = (typeof tabs)[number]['id'];

export function SettingsPageClient({ settings, webhookLogs }: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('branding');

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/payt`
    : '/api/webhooks/payt';

  return (
    <div>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie as configurações da sua plataforma</p>
      </motion.header>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6 flex gap-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="settings-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'branding' && (
            <BrandingSettings
              initialName={(settings.platform_name as string) ?? 'Memberly'}
              initialColor={(settings.primary_color as string) ?? '#3B82F6'}
              initialLogo={(settings.logo_url as string | null) ?? null}
            />
          )}
          {activeTab === 'webhooks' && (
            <WebhookSettings
              webhookUrl={webhookUrl}
              initialSecret={(settings.webhook_secret as string) ?? ''}
              logs={webhookLogs}
            />
          )}
          {activeTab === 'email' && (
            <EmailSettings
              initialActive={(settings.welcome_email_active as boolean) ?? true}
              initialSubject={(settings.welcome_email_subject as string) ?? 'Bem-vindo(a) ao {{product_name}}!'}
              initialBody={(settings.welcome_email_body as string) ?? 'Olá {{member_name}},\n\nSeu acesso ao {{product_name}} foi liberado!\n\nAcesse agora: {{login_url}}\n\nQualquer dúvida, entre em contato.\n\nAbraço,\nEquipe {{platform_name}}'}
              platformName={(settings.platform_name as string) ?? 'Memberly'}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
