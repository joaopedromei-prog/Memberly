'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Link as LinkIcon, Loader2 } from 'lucide-react';
import { slugify } from '@/lib/utils/slugify';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import { BannerGenerator } from '@/components/admin/BannerGenerator';

export function NewProductClient() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [showSlugField, setShowSlugField] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Auto-generate slug from title with debounce
  useEffect(() => {
    if (!isSlugCustomized) {
      const timer = setTimeout(() => {
        setSlug(slugify(title));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [title, isSlugCustomized]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setIsSlugCustomized(true);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCreate(asDraft: boolean) {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = (await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          slug: slug || undefined,
          banner_url: bannerUrl,
          is_published: !asDraft,
        }),
      })) as { id: string };
      addToast(
        asDraft ? 'Rascunho criado com sucesso' : 'Produto criado com sucesso',
        'success'
      );
      router.push(`/admin/products/${res.id}`);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'DUPLICATE_SLUG') {
        setErrors({ slug: 'Este slug já está em uso' });
        setShowSlugField(true);
      } else {
        addToast(
          err instanceof ApiRequestError ? err.message : 'Erro ao criar produto',
          'error'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Character counter colors
  const descLength = description.length;
  const descColor =
    descLength >= 500
      ? 'text-red-500'
      : descLength >= 450
        ? 'text-amber-500'
        : 'text-slate-400';

  // Step indicator: step 1 = basic info filled, step 2 = description filled, step 3 = banner
  const step1Done = title.trim().length > 0;
  const step2Done = step1Done && description.trim().length > 0;

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Novo Produto</h1>
          <Link
            href="/admin/products"
            className="text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            Cancelar
          </Link>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
          className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
        >
          {/* Step Indicator */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
            }}
            className="mb-8 flex items-center justify-center"
          >
            <div className="flex items-center">
              {/* Step 1: Básico */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }}
                  className="relative z-10 h-3 w-3 rounded-full bg-blue-600"
                >
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full ring-4 ring-blue-100"
                  />
                </motion.div>
                <motion.span
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  className="absolute top-5 text-xs font-medium text-blue-600"
                >
                  Básico
                </motion.span>
              </div>

              {/* Line 1 */}
              <motion.div
                variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
                style={{ originX: 0 }}
                className={`mx-2 h-px w-16 ${step1Done ? 'bg-blue-600' : 'bg-slate-200'}`}
              />

              {/* Step 2: Detalhes */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }}
                  className={`relative z-10 h-3 w-3 rounded-full ${step1Done ? 'bg-blue-600' : 'bg-slate-200'}`}
                />
                <motion.span
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  className={`absolute top-5 text-xs ${step1Done ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  Detalhes
                </motion.span>
              </div>

              {/* Line 2 */}
              <motion.div
                variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
                style={{ originX: 0 }}
                className={`mx-2 h-px w-16 ${step2Done ? 'bg-blue-600' : 'bg-slate-200'}`}
              />

              {/* Step 3: Banner */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }}
                  className={`relative z-10 h-3 w-3 rounded-full ${step2Done ? 'bg-blue-600' : 'bg-slate-200'}`}
                />
                <motion.span
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  className={`absolute top-5 text-xs ${step2Done ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  Banner
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
            }}
            className="mt-12 space-y-6"
          >
            {/* Title */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <label htmlFor="title" className="block text-base font-semibold text-slate-900">
                Como se chama seu produto?
              </label>
              <p className="mt-1 text-sm text-slate-400">O nome que seus membros verão</p>
              <input
                ref={titleInputRef}
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Método Completo de Calistenia"
                className="mt-3 h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <label
                htmlFor="description"
                className="block text-base font-semibold text-slate-900"
              >
                Descreva seu produto
              </label>
              <p className="mt-1 text-sm text-slate-400">Uma breve descrição para seus membros</p>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Do que se trata este curso?"
                rows={4}
                className="mt-3 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
              <div className={`mt-1 text-right text-xs transition-colors ${descColor}`}>
                {descLength}/500
              </div>
            </motion.div>

            {/* Slug */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <button
                type="button"
                onClick={() => setShowSlugField(!showSlugField)}
                className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
              >
                <LinkIcon className="h-4 w-4" />
                Personalizar URL
              </button>

              <AnimatePresence>
                {showSlugField && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <label
                        htmlFor="slug"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Slug (URL)
                      </label>
                      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30">
                        <div className="flex select-none items-center border-r border-slate-200 bg-slate-100 px-3 text-sm text-slate-400">
                          /products/
                        </div>
                        <input
                          type="text"
                          id="slug"
                          value={slug}
                          onChange={handleSlugChange}
                          className="h-11 flex-1 bg-white px-3 text-sm text-slate-900 outline-none"
                        />
                      </div>
                      {errors.slug && (
                        <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {!isSlugCustomized && title
                          ? 'Gerado automaticamente do título'
                          : 'URL personalizada'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Banner */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <label className="block text-base font-semibold text-slate-900">
                Banner do produto
              </label>
              <p className="mt-1 text-sm text-slate-400">
                Imagem de capa (recomendado 16:9)
              </p>

              <div className="mt-3">
                {bannerUrl ? (
                  <div className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200">
                    <img
                      src={bannerUrl}
                      alt="Banner do produto"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setBannerUrl(null)}
                        className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900 transition-colors hover:bg-white"
                      >
                        Trocar
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerUrl(null)}
                        className="rounded-lg bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <BannerGenerator
                    defaultPrompt={
                      title ? `${title} - banner profissional, moderno, 16:9` : ''
                    }
                    onBannerGenerated={(url) => setBannerUrl(url)}
                    onBannerRemoved={() => setBannerUrl(null)}
                    entityType="product"
                    entityName={title}
                    productSlug={slug || undefined}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-8 flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:gap-0"
          >
            <Link
              href="/admin/products"
              className="w-full py-2 text-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 sm:w-auto sm:text-left"
            >
              Cancelar
            </Link>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                disabled={!title.trim() || isSubmitting}
                onClick={() => handleCreate(true)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Salvar como Rascunho
              </button>
              <button
                type="button"
                disabled={!title.trim() || isSubmitting}
                onClick={() => handleCreate(false)}
                className={`flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-medium text-white transition-all duration-200 sm:w-auto ${
                  !title.trim()
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Criar Produto'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
