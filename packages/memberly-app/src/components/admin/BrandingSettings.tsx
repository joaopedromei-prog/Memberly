'use client';

import { useState, useRef } from 'react';
import { useToastStore } from '@/stores/toast-store';

interface BrandingSettingsProps {
  initialName: string;
  initialColor: string;
  initialLogo: string | null;
}

export function BrandingSettings({ initialName, initialColor, initialLogo }: BrandingSettingsProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [logoUrl] = useState(initialLogo);
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const isChanged = name !== initialName || color !== initialColor;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform_name: name, primary_color: color }),
      });
      if (!res.ok) throw new Error('Failed to save');
      addToast('Branding salvo com sucesso', 'success');
    } catch {
      addToast('Erro ao salvar branding', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900">Identidade da Plataforma</h2>
        <p className="text-sm text-slate-500">Personalize o visual da sua área de membros</p>

        <div className="border-t border-slate-200 mt-4 pt-5 space-y-5">
          {/* Platform Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Exibido no header e emails</p>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">Alterar logo</button>
                  {logoUrl && (
                    <button className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">Remover</button>
                  )}
                </div>
                <p className="text-xs text-slate-400">PNG ou SVG, max 2MB</p>
              </div>
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cor primária</label>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl border border-slate-200 cursor-pointer overflow-hidden relative shadow-sm"
                onClick={() => colorInputRef.current?.click()}
              >
                <div className="absolute inset-0" style={{ backgroundColor: color }} />
                <input
                  ref={colorInputRef}
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-32 h-11 rounded-xl border border-slate-200 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
              />
              <div className="flex gap-2 ml-4 items-center">
                <div
                  className="text-white rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: color }}
                >
                  Botão
                </div>
                <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-1/2 rounded-full" style={{ backgroundColor: color }} />
                </div>
              </div>
            </div>
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
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}
