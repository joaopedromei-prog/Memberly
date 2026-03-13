'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useToastStore } from '@/stores/toast-store';
import type { WebhookLogEntry } from '@/app/admin/settings/SettingsPageClient';

interface WebhookSettingsProps {
  webhookUrl: string;
  initialSecret: string;
  logs: WebhookLogEntry[];
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `há ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export function WebhookSettings({ webhookUrl, initialSecret, logs }: WebhookSettingsProps) {
  const [secret, setSecret] = useState(initialSecret);
  const [secretVisible, setSecretVisible] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [rotating, setRotating] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const maskedSecret = secret
    ? `${secret.slice(0, 6)}${'•'.repeat(Math.max(0, secret.length - 6))}`
    : '••••••••••••••••';

  const handleCopy = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  async function rotateSecret() {
    setRotating(true);
    try {
      const res = await fetch('/api/settings/webhook-secret', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSecret(data.data?.secret ?? data.secret);
      setSecretVisible(true);
      addToast('Secret rotacionado com sucesso', 'success');
    } catch {
      addToast('Erro ao rotacionar secret', 'error');
    } finally {
      setRotating(false);
    }
  }

  const lastLog = logs[0];
  const lastEventTime = lastLog ? relativeTime(lastLog.created_at) : null;

  return (
    <div className="space-y-5">
      {/* Webhook URL */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900">Endpoint do Webhook</h2>
        <p className="text-sm text-slate-500">Configure sua plataforma de pagamento para enviar eventos para esta URL</p>

        <div className="mt-4 flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 p-2 pl-3">
          <span className="flex-1 text-sm font-mono text-slate-700 truncate">{webhookUrl}</span>
          <button
            onClick={() => handleCopy(webhookUrl, setCopiedUrl)}
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors shrink-0"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copiedUrl ? (
                <motion.div key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                  <Check size={16} className="text-emerald-500" />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                  <Copy size={16} className="text-slate-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {lastEventTime && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-slate-600">Ativo — último evento recebido {lastEventTime}</span>
          </div>
        )}
      </div>

      {/* Secret Key */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900">Secret Key</h2>
        <p className="text-sm text-slate-500">Usada para verificar a autenticidade dos webhooks recebidos</p>

        <div className="mt-4 flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 p-2 pl-3">
          <div className="flex-1 text-sm font-mono text-slate-700 truncate relative h-5">
            <AnimatePresence mode="wait">
              <motion.span
                key={secretVisible ? 'visible' : 'masked'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0"
              >
                {secretVisible ? secret : maskedSecret}
              </motion.span>
            </AnimatePresence>
          </div>
          <button
            onClick={() => setSecretVisible(!secretVisible)}
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors shrink-0"
          >
            {secretVisible ? <EyeOff size={16} className="text-slate-500" /> : <Eye size={16} className="text-slate-500" />}
          </button>
          <button
            onClick={() => handleCopy(secret, setCopiedSecret)}
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors shrink-0"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copiedSecret ? (
                <motion.div key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                  <Check size={16} className="text-emerald-500" />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                  <Copy size={16} className="text-slate-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={rotateSecret}
            disabled={rotating}
            className="flex items-center border border-slate-200 bg-white text-slate-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <AlertTriangle size={16} className="text-amber-500 mr-2" />
            {rotating ? 'Gerando...' : 'Gerar Novo Secret'}
          </button>
          <p className="text-xs text-amber-600 mt-2">Atenção: rotacionar o secret invalida o anterior imediatamente.</p>
        </div>
      </div>

      {/* Recent Webhook Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-semibold text-slate-900">Últimos Webhooks Recebidos</h2>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">últimas 24h</span>
          </div>

          <div className="flex flex-col">
            {logs.map((log, i) => (
              <div key={log.id} className={`flex items-center gap-3 py-3 ${i !== logs.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  log.status === 'processed' ? 'bg-emerald-500' :
                  log.status === 'failed' ? 'bg-red-500' : 'bg-slate-400'
                }`} />
                <span className="text-sm font-mono text-slate-700">{log.event_type}</span>
                <span className="text-sm text-slate-500 truncate max-w-[200px]">
                  {(log.payload as Record<string, unknown>)?.email as string ?? ''}
                </span>
                <span className="text-xs text-slate-400 ml-auto">{relativeTime(log.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
