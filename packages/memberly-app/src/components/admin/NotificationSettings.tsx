'use client';

import { useState } from 'react';
import { Bell, BookOpen, MessageCircle, Trophy } from 'lucide-react';
import { useToastStore } from '@/stores/toast-store';
import type { NotificationsConfig } from '@/types/database';

interface NotificationSettingsProps {
  productId: string;
  initialConfig: NotificationsConfig;
}

const DEFAULT_CONFIG: NotificationsConfig = {
  NEW_LESSON: true,
  COMMENT_REPLY: true,
  COURSE_COMPLETED: true,
};

const NOTIFICATION_LABELS = [
  {
    key: 'NEW_LESSON' as const,
    label: 'Nova aula publicada',
    description: 'Notificar membros quando uma nova aula é publicada',
    icon: BookOpen,
  },
  {
    key: 'COMMENT_REPLY' as const,
    label: 'Resposta a comentário',
    description: 'Notificar quando alguém responde a um comentário',
    icon: MessageCircle,
  },
  {
    key: 'COURSE_COMPLETED' as const,
    label: 'Curso concluído',
    description: 'Notificar quando o membro completa 100% do curso',
    icon: Trophy,
  },
];

export function NotificationSettings({ productId, initialConfig }: NotificationSettingsProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [config, setConfig] = useState<NotificationsConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });
  const [saving, setSaving] = useState(false);

  async function handleToggle(key: keyof NotificationsConfig) {
    const previousConfig = { ...config };
    const newConfig = { ...config, [key]: !config[key] };
    setConfig(newConfig);
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications_config: newConfig }),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }
    } catch {
      // Revert on failure
      setConfig(previousConfig);
      addToast('Erro ao salvar configuração de notificações', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Bell size={18} className="text-amber-500" />
        <h2 className="text-base font-semibold text-slate-900">Notificações</h2>
      </div>
      <p className="text-sm text-slate-500 mb-5">
        Controle quais notificações os membros recebem para este produto
      </p>
      <div className="space-y-4">
        {NOTIFICATION_LABELS.map(({ key, label, description, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50">
                <Icon size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config[key]}
              aria-label={label}
              onClick={() => handleToggle(key)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                config[key] ? 'bg-primary' : 'bg-gray-600'
              } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config[key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
