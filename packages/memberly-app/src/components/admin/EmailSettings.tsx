'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useToastStore } from '@/stores/toast-store';

interface EmailSettingsProps {
  initialActive: boolean;
  initialSubject: string;
  initialBody: string;
  platformName: string;
}

export function EmailSettings({ initialActive, initialSubject, initialBody, platformName }: EmailSettingsProps) {
  const [emailActive, setEmailActive] = useState(initialActive);
  const [emailSubject, setEmailSubject] = useState(initialSubject);
  const [emailBody, setEmailBody] = useState(initialBody);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const isChanged = emailActive !== initialActive || emailSubject !== initialSubject || emailBody !== initialBody;

  const renderPreviewBody = () => {
    let preview = emailBody;
    preview = preview.replace(/\{\{member_name\}\}/g, '<span class="bg-blue-50 text-blue-700 rounded px-1">João Silva</span>');
    preview = preview.replace(/\{\{product_name\}\}/g, '<span class="bg-blue-50 text-blue-700 rounded px-1">Método Completo de Calistenia</span>');
    preview = preview.replace(/\{\{login_url\}\}/g, '<span class="bg-blue-50 text-blue-700 rounded px-1">https://memberly.com/login</span>');
    preview = preview.replace(/\{\{platform_name\}\}/g, `<span class="bg-blue-50 text-blue-700 rounded px-1">${platformName}</span>`);
    return preview.replace(/\n/g, '<br/>');
  };

  const previewSubject = emailSubject.replace(/\{\{product_name\}\}/g, 'Método Completo de Calistenia');

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          welcome_email_active: emailActive,
          welcome_email_subject: emailSubject,
          welcome_email_body: emailBody,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      addToast('Template de email salvo', 'success');
    } catch {
      addToast('Erro ao salvar template', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900">Email de Boas-Vindas</h2>
        <p className="text-sm text-slate-500">Enviado automaticamente quando um membro recebe acesso a um produto</p>

        {/* Active toggle */}
        <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-5">
          <span className="text-sm font-medium text-slate-700">Ativo</span>
          <button
            type="button"
            onClick={() => setEmailActive(!emailActive)}
            className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${emailActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
              animate={{ left: emailActive ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assunto</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Use {"{{product_name}}"} para inserir o nome do produto</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Corpo do Email</label>
            <textarea
              rows={8}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
            />
            <p className="text-xs text-slate-400 mt-1">
              Variáveis: {"{{member_name}}"}, {"{{product_name}}"}, {"{{login_url}}"}, {"{{platform_name}}"}
            </p>
          </div>

          {/* Preview toggle */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setPreviewOpen(!previewOpen)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
            >
              Pré-visualizar
              <motion.div animate={{ rotate: previewOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={16} />
              </motion.div>
            </button>

            <AnimatePresence>
              {previewOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <div className="text-xs text-slate-500 mb-1">
                      De: <span className="font-medium text-slate-700">{platformName} &lt;noreply@memberly.com&gt;</span>
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      Assunto: {previewSubject}
                    </div>
                    <div className="border-t border-slate-200 my-3" />
                    <div
                      className="text-sm text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderPreviewBody() }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isChanged || saving}
          className={`bg-blue-600 text-white rounded-lg h-10 px-5 font-medium transition-all ${
            !isChanged || saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'
          }`}
        >
          {saving ? 'Salvando...' : 'Salvar Template'}
        </button>
      </div>
    </div>
  );
}
