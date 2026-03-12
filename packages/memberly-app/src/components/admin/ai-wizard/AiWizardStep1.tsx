'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { wizardInputsSchema, type WizardInputs } from '@/types/ai';
import { cn } from '@/lib/utils/cn';

interface AiWizardStep1Props {
  initialValues?: Partial<WizardInputs>;
  onSubmit: (inputs: WizardInputs) => void;
}

export function AiWizardStep1({ initialValues, onSubmit }: AiWizardStep1Props) {
  const [productName, setProductName] = useState(initialValues?.productName ?? '');
  const [topic, setTopic] = useState(initialValues?.topic ?? '');
  const [targetAudience, setTargetAudience] = useState(initialValues?.targetAudience ?? '');
  const [moduleCount, setModuleCount] = useState(initialValues?.moduleCount ?? 5);
  const [tone, setTone] = useState<'formal' | 'informal'>(initialValues?.tone ?? 'informal');
  const [generateBanners, setGenerateBanners] = useState(initialValues?.generateBanners ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = wizardInputsSchema.safeParse({
      productName,
      topic,
      targetAudience,
      moduleCount,
      tone,
      generateBanners,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Informações do Produto</h2>
        <p className="mt-1 text-sm text-gray-500">
          Preencha os dados abaixo e a IA criará a estrutura completa.
        </p>
      </div>

      <Input
        id="productName"
        label="Nome do Produto"
        placeholder="Ex: Masterclass de Marketing Digital"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        error={errors.productName}
      />

      <Input
        id="topic"
        label="Tema / Nicho"
        placeholder="Ex: Marketing Digital para Negócios Locais"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        error={errors.topic}
      />

      <div className="w-full">
        <label htmlFor="targetAudience" className="mb-1 block text-sm font-medium text-gray-700">
          Público-alvo
        </label>
        <textarea
          id="targetAudience"
          rows={3}
          className={cn(
            'block w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
            errors.targetAudience
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          )}
          placeholder="Ex: Empreendedores iniciantes que querem atrair clientes pela internet"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
        />
        {errors.targetAudience && (
          <p className="mt-1 text-sm text-red-600">{errors.targetAudience}</p>
        )}
      </div>

      <div className="w-full">
        <label htmlFor="moduleCount" className="mb-1 block text-sm font-medium text-gray-700">
          Número de Módulos: <span className="font-semibold text-purple-600">{moduleCount}</span>
        </label>
        <input
          id="moduleCount"
          type="range"
          min={1}
          max={20}
          value={moduleCount}
          onChange={(e) => setModuleCount(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      <div className="w-full">
        <label className="mb-1 block text-sm font-medium text-gray-700">Tom do Conteúdo</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTone('informal')}
            className={cn(
              'flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tone === 'informal'
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            Informal
          </button>
          <button
            type="button"
            onClick={() => setTone('formal')}
            className={cn(
              'flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tone === 'formal'
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            Formal
          </button>
        </div>
      </div>

      <div className="w-full">
        <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={generateBanners}
            onChange={(e) => setGenerateBanners(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Gerar banners automaticamente</span>
            <p className="mt-0.5 text-xs text-gray-500">
              Usa IA para gerar imagens de banner para cada modulo e produto
            </p>
          </div>
        </label>
      </div>

      <Button type="submit" className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500">
        Gerar Estrutura
      </Button>
    </form>
  );
}
