'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiWizardStep1 } from '@/components/admin/ai-wizard/AiWizardStep1';
import { AiWizardStep2 } from '@/components/admin/ai-wizard/AiWizardStep2';
import { AiWizardStep3 } from '@/components/admin/ai-wizard/AiWizardStep3';
import type { WizardInputs, GeneratedStructure, WizardBanners } from '@/types/ai';

type WizardStep = 1 | 2 | 3;

export default function AiWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [inputs, setInputs] = useState<WizardInputs | null>(null);
  const [structure, setStructure] = useState<GeneratedStructure | null>(null);
  const [banners, setBanners] = useState<WizardBanners | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleStep1Submit(data: WizardInputs) {
    setInputs(data);
    setStep(2);
  }

  function handleGenerationSuccess(data: GeneratedStructure, generatedBanners: WizardBanners | null) {
    setStructure(data);
    setBanners(generatedBanners);
    setStep(3);
  }

  function handleGenerationError() {
    // Error is displayed within Step 2 component
  }

  function handleRegenerate() {
    setStructure(null);
    setBanners(null);
    setStep(2);
  }

  function handleBack() {
    setStep(1);
  }

  async function handleApprove(editedStructure?: GeneratedStructure, finalBanners?: WizardBanners | null) {
    const toSave = editedStructure ?? structure;
    if (!toSave) return;
    setIsSaving(true);

    const activeBanners = finalBanners ?? banners;
    const bannerUrls = activeBanners
      ? {
          product: activeBanners.product.status === 'generated' ? activeBanners.product.url : null,
          modules: activeBanners.modules.map((b) =>
            b.status === 'generated' ? b.url : null
          ),
        }
      : undefined;

    try {
      const response = await fetch('/api/ai/save-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structure: toSave, bannerUrls }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message ?? 'Erro ao salvar');
      }

      const { productId } = await response.json();
      router.push(`/admin/products/${productId}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar estrutura');
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/products')}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Produtos
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Criar com IA</h1>

        {/* Step Indicator */}
        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  s === step
                    ? 'bg-purple-600 text-white'
                    : s < step
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s < step ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div className={`h-0.5 w-8 ${s < step ? 'bg-purple-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {step === 1 && 'Informações'}
            {step === 2 && 'Gerando...'}
            {step === 3 && 'Revisão'}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <AiWizardStep1
            initialValues={inputs ?? undefined}
            onSubmit={handleStep1Submit}
          />
        )}

        {step === 2 && inputs && (
          <AiWizardStep2
            inputs={inputs}
            onSuccess={handleGenerationSuccess}
            onError={handleGenerationError}
          />
        )}

        {step === 3 && structure && (
          <AiWizardStep3
            structure={structure}
            banners={banners}
            onApprove={handleApprove}
            onRegenerate={handleRegenerate}
            onBack={handleBack}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}
