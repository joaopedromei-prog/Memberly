'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  Eye,
  Sparkles,
  Grid,
  Link as LinkIcon,
  Copy,
  Users,
  BarChart,
  ChevronDown,
  Loader2,
  Trash2,
} from 'lucide-react';
import { slugify } from '@/lib/utils/slugify';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import { useUIStore } from '@/stores/ui-store';
import { BannerGenerator } from '@/components/admin/BannerGenerator';
import { ProductContentManager } from '@/components/admin/ProductContentManager';
import { ProductMappings } from '@/components/admin/ProductMappings';
import { DuplicateProductDialog } from '@/components/admin/DuplicateProductDialog';
import { NotificationSettings } from '@/components/admin/NotificationSettings';
import type { Product, NotificationsConfig } from '@/types/database';
import type { ModuleWithLessons } from '@/types/api';

interface ProductPageClientProps {
  product: Product;
  modules: ModuleWithLessons[];
  memberCount?: number;
  totalLessons?: number;
}

export function ProductPageClient({
  product,
  modules,
  memberCount = 0,
  totalLessons = 0,
}: ProductPageClientProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const setBreadcrumbLabel = useUIStore((s) => s.setBreadcrumbLabel);
  const clearBreadcrumbLabels = useUIStore((s) => s.clearBreadcrumbLabels);

  // Form state
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [slug, setSlug] = useState(product.slug);
  const [bannerUrl, setBannerUrl] = useState<string | null>(product.banner_url);
  const [isPublished, setIsPublished] = useState(product.is_published);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true);
  const [showAdvancedSlug, setShowAdvancedSlug] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // UI state
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  const modulesRef = useRef<HTMLDivElement>(null);
  const integrationsRef = useRef<HTMLDivElement>(null);

  // Track changes
  const hasChanges =
    title !== product.title ||
    description !== product.description ||
    slug !== product.slug ||
    bannerUrl !== product.banner_url ||
    isPublished !== product.is_published;

  useEffect(() => {
    setBreadcrumbLabel(product.id, product.title);
    return () => clearBreadcrumbLabels();
  }, [product.id, product.title, setBreadcrumbLabel, clearBreadcrumbLabels]);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slugManuallyEdited) {
      setSlug(slugify(newTitle));
    }
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

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await apiRequest(`/api/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          description,
          slug,
          banner_url: bannerUrl,
          is_published: isPublished,
        }),
      });
      addToast('Produto atualizado com sucesso', 'success');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'DUPLICATE_SLUG') {
        setErrors({ slug: 'Este slug já está em uso' });
      } else {
        addToast(
          err instanceof ApiRequestError ? err.message : 'Erro ao salvar produto',
          'error'
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTogglePublish() {
    const newValue = !isPublished;
    setIsPublished(newValue);
    try {
      await fetch(`/api/products/${product.id}/publish`, { method: 'PATCH' });
      addToast(
        newValue ? 'Produto publicado' : 'Produto despublicado',
        'success'
      );
      router.refresh();
    } catch {
      setIsPublished(!newValue);
      addToast('Erro ao alterar publicação', 'error');
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza? Esta ação é irreversível e removerá todos os módulos e aulas.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await apiRequest(`/api/products/${product.id}`, { method: 'DELETE' });
      addToast('Produto excluído', 'success');
      router.push('/admin/products');
    } catch {
      addToast('Erro ao excluir produto', 'error');
      setIsDeleting(false);
    }
  }

  function scrollToModules() {
    setShowModules(true);
    setTimeout(() => modulesRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  function scrollToIntegrations() {
    setShowIntegrations(true);
    setTimeout(() => integrationsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-500">
        <Link href="/admin/products" className="transition-colors hover:text-slate-900">
          Produtos
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-slate-400" />
        <span className="max-w-[200px] truncate sm:max-w-none">{product.title}</span>
        <ChevronRight className="mx-2 h-4 w-4 text-slate-400" />
        <span className="font-medium text-slate-900">Editar</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-slate-900">Editar Produto</h1>
        <div className="flex items-center gap-3">
          {product.slug && (
            <a
              href={`/products/${product.slug}?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Ver como membro</span>
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-all ${
              hasChanges && !isSaving
                ? 'bg-blue-600 shadow-sm hover:bg-blue-700'
                : 'cursor-not-allowed bg-blue-600/50'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
        {/* Left Column (60%) */}
        <motion.div
          className="flex w-full flex-col gap-6 lg:w-[60%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Basic Info Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">Informações Básicas</h2>
            <p className="mt-1 text-sm text-slate-500">Detalhes principais do produto</p>

            <div className="mt-4 flex flex-col gap-5 border-t border-slate-100 pt-5">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  placeholder="Ex: Curso de Marketing Digital"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Slug (Advanced) */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSlug(!showAdvancedSlug)}
                  className="flex items-center gap-1.5 self-start text-sm text-slate-500 transition-colors hover:text-slate-700"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${showAdvancedSlug ? 'rotate-180' : ''}`}
                  />
                  Configurações avançadas
                </button>

                <AnimatePresence>
                  {showAdvancedSlug && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Slug (URL)
                        </label>
                        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30">
                          <span className="select-none border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                            /products/
                          </span>
                          <input
                            type="text"
                            id="slug"
                            value={slug}
                            onChange={(e) => {
                              setSlug(e.target.value);
                              setSlugManuallyEdited(true);
                            }}
                            className="h-11 flex-1 bg-transparent px-3 text-sm text-slate-900 focus:outline-none"
                          />
                        </div>
                        {errors.slug && (
                          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                        )}
                        <p className="mt-2 text-xs text-slate-400">
                          Gerado automaticamente do título. Edite apenas se necessário.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Descrição
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  className="resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  placeholder="Descreva o que os alunos vão aprender..."
                />
                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-slate-400">{description.length}/500</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Banner Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Banner</h2>
                <p className="mt-1 text-sm text-slate-500">Imagem de capa do produto (16:9)</p>
              </div>
            </div>

            <div className="mt-4">
              {bannerUrl ? (
                <div className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={bannerUrl}
                    alt="Banner do produto"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setBannerUrl(null)}
                      className="rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                    >
                      Alterar
                    </button>
                  </div>
                </div>
              ) : (
                <BannerGenerator
                  defaultPrompt={title ? `${title} - banner profissional, moderno, 16:9` : ''}
                  onBannerGenerated={(url) => setBannerUrl(url)}
                  onBannerRemoved={() => setBannerUrl(null)}
                  entityType="product"
                  entityName={title}
                  productSlug={slug || undefined}
                />
              )}

              {bannerUrl && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <BannerActionsInline
                    title={title}
                    slug={slug}
                    onGenerated={(url) => setBannerUrl(url)}
                  />
                  <button
                    type="button"
                    onClick={() => setBannerUrl(null)}
                    className="ml-auto text-sm font-medium text-red-500 transition-colors hover:text-red-700 sm:ml-0"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-xl border border-red-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-red-600">Zona de Perigo</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ações irreversíveis. Tenha certeza antes de prosseguir.
            </p>

            <div className="mt-4 border-t border-red-100 pt-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-medium text-slate-900">Excluir Produto</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Remove o produto e todos os módulos e aulas associados
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>

        {/* Right Column (40%) */}
        <motion.div
          className="flex w-full flex-col gap-6 lg:w-[40%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Status Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">Status de Publicação</h2>

            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                onClick={handleTogglePublish}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow ring-0 ${
                    isPublished ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div>
                <p
                  className={`text-sm font-medium ${isPublished ? 'text-emerald-700' : 'text-slate-600'}`}
                >
                  {isPublished ? 'Publicado' : 'Rascunho'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {isPublished
                    ? 'Visível para membros com acesso'
                    : 'Não visível para membros'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <StatCard icon={<Grid className="h-4 w-4 text-slate-400" />} value={modules.length} label="módulos" />
              <StatCard
                icon={
                  <svg className="h-4 w-4 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                }
                value={totalLessons}
                label="aulas"
              />
              <StatCard icon={<Users className="h-4 w-4 text-slate-400" />} value={memberCount} label="membros" />
              <StatCard icon={<BarChart className="h-4 w-4 text-slate-400" />} value="—" label="conclusão" />
            </div>
          </motion.section>

          {/* Quick Links */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">Acesso Rápido</h2>

            <div className="mt-4 flex flex-col gap-2">
              <QuickLink
                icon={<Grid className="h-4 w-4 text-purple-600" />}
                iconBg="bg-purple-50"
                label="Gerenciar Módulos"
                badge={`${modules.length} módulos`}
                onClick={scrollToModules}
              />
              <QuickLink
                icon={<LinkIcon className="h-4 w-4 text-blue-600" />}
                iconBg="bg-blue-50"
                label="Configurar Webhooks"
                onClick={scrollToIntegrations}
              />
              {product.slug && (
                <a
                  href={`/products/${product.slug}?preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-slate-100 hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-50">
                    <Eye className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Ver como Membro</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </a>
              )}
            </div>
          </motion.section>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <NotificationSettings
              productId={product.id}
              initialConfig={product.notifications_config as NotificationsConfig ?? { NEW_LESSON: true, COMMENT_REPLY: true, COURSE_COMPLETED: true }}
            />
          </motion.div>

          {/* Duplicate */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">Duplicar Produto</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cria uma cópia completa com todos os módulos e aulas
            </p>

            <button
              type="button"
              onClick={() => setShowDuplicate(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
              Duplicar Produto
            </button>
          </motion.section>
        </motion.div>
      </div>

      {/* Expandable: Modules */}
      <div ref={modulesRef}>
        <button
          type="button"
          onClick={() => setShowModules(!showModules)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 text-left shadow-sm transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <Grid className="h-5 w-5 text-purple-600" />
            <span className="text-base font-semibold text-slate-900">
              Módulos e Aulas
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {modules.length}
            </span>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${showModules ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {showModules && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <ProductContentManager productId={product.id} modules={modules} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable: Integrations */}
      <div ref={integrationsRef}>
        <button
          type="button"
          onClick={() => setShowIntegrations(!showIntegrations)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 text-left shadow-sm transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            <span className="text-base font-semibold text-slate-900">
              Integrações e Webhooks
            </span>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${showIntegrations ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {showIntegrations && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <ProductMappings productId={product.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Duplicate Dialog */}
      {showDuplicate && (
        <DuplicateProductDialog
          productId={product.id}
          productTitle={product.title}
          onClose={() => setShowDuplicate(false)}
        />
      )}
    </div>
  );
}

/* ---- Helper Components ---- */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  const formatted =
    typeof value === 'number' && value >= 1000
      ? value.toLocaleString('pt-BR')
      : String(value);

  return (
    <div className="flex flex-col gap-1 rounded-lg bg-slate-50 p-3">
      <div className="mb-1">{icon}</div>
      <span className="text-lg font-semibold text-slate-900">{formatted}</span>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}

function QuickLink({
  icon,
  iconBg,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-slate-100 hover:bg-slate-50"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
      </div>
      {badge && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function BannerActionsInline({
  title,
  slug,
  onGenerated,
}: {
  title: string;
  slug: string;
  onGenerated: (url: string) => void;
}) {
  const [showAI, setShowAI] = useState(false);

  if (showAI) {
    return (
      <div className="w-full">
        <BannerGenerator
          defaultPrompt={title ? `${title} - banner profissional, moderno, 16:9` : ''}
          onBannerGenerated={(url) => {
            onGenerated(url);
            setShowAI(false);
          }}
          entityType="product"
          entityName={title}
          productSlug={slug || undefined}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowAI(true)}
      className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
    >
      <Sparkles className="h-4 w-4" />
      Gerar com IA
    </button>
  );
}
