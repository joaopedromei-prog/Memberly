import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductHero } from '@/components/member/ProductHero';
import { ModuleList, type ModuleWithProgress } from '@/components/member/ModuleList';
import { PreviewBanner } from '@/components/member/PreviewBanner';
import { isDripUnlocked, getEffectiveDripDays } from '@/lib/utils/drip';

interface Lesson {
  id: string;
  title: string;
  sort_order: number;
  is_published: boolean;
  drip_days: number | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  sort_order: number;
  drip_days: number | null;
  lessons: Lesson[];
}

interface Product {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  slug: string;
  modules: Module[];
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if admin preview mode
  const isPreviewMode = preview === 'true';
  let isAdminPreview = false;

  if (isPreviewMode) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdminPreview = profile?.role === 'admin';
  }

  // Fetch product — in admin preview, skip is_published filter
  let productQuery = supabase
    .from('products')
    .select(`
      id, title, description, banner_url, slug,
      modules (
        id, title, description, banner_url, sort_order, drip_days,
        lessons ( id, title, sort_order, is_published, drip_days )
      )
    `)
    .eq('slug', slug);

  if (!isAdminPreview) {
    productQuery = productQuery.eq('is_published', true);
  }

  const { data: product } = await productQuery.single<Product>();

  if (!product) {
    redirect('/?message=produto-nao-encontrado');
  }

  // Verify access and get granted_at (skip for admin preview)
  let grantedAt: string | null = null;

  if (!isAdminPreview) {
    const { data: accessData } = await supabase
      .from('member_access')
      .select('product_id, granted_at')
      .eq('profile_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (!accessData) {
      redirect('/?message=sem-acesso');
    }
    grantedAt = accessData.granted_at;
  }

  // Fetch member progress
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed')
    .eq('profile_id', user.id)
    .eq('completed', true);

  const completedLessonIds = new Set(
    (progressData || []).map((p) => p.lesson_id)
  );

  // Sort modules by sort_order
  const sortedModules = [...product.modules].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  // Calculate progress per module and find next lesson URLs
  const previewSuffix = isAdminPreview ? '?preview=true' : '';

  const modulesWithProgress: ModuleWithProgress[] = sortedModules.map((mod) => {
    const sortedLessons = [...mod.lessons]
      .filter((l) => isAdminPreview || l.is_published)
      .sort((a, b) => a.sort_order - b.sort_order);
    const totalLessons = sortedLessons.length;
    const completedLessons = sortedLessons.filter((l) =>
      completedLessonIds.has(l.id)
    ).length;

    // Drip check for module
    const moduleDripDays = mod.drip_days;
    const isModuleLocked = !isAdminPreview && grantedAt
      ? !isDripUnlocked(grantedAt, moduleDripDays)
      : false;

    const effectiveDrip = getEffectiveDripDays(moduleDripDays, null);

    const nextLesson = sortedLessons.find(
      (l) => !completedLessonIds.has(l.id)
    );
    const nextLessonUrl = nextLesson
      ? `/products/${slug}/lessons/${nextLesson.id}${previewSuffix}`
      : null;

    return {
      id: mod.id,
      title: mod.title,
      description: isAdminPreview
        ? mod.description +
          (mod.lessons.some((l) => !l.is_published)
            ? ` (${mod.lessons.filter((l) => !l.is_published).length} rascunho(s))`
            : '')
        : mod.description,
      bannerUrl: mod.banner_url,
      sortOrder: mod.sort_order,
      totalLessons,
      completedLessons,
      nextLessonUrl,
      isLocked: isModuleLocked,
      effectiveDripDays: effectiveDrip,
    };
  });

  // Global stats
  const totalModules = modulesWithProgress.length;
  const totalLessons = modulesWithProgress.reduce(
    (sum, m) => sum + m.totalLessons,
    0
  );
  const totalCompleted = modulesWithProgress.reduce(
    (sum, m) => sum + m.completedLessons,
    0
  );

  // Find the global next uncompleted lesson
  const allLessons = sortedModules.flatMap((mod) =>
    [...mod.lessons]
      .filter((l) => isAdminPreview || l.is_published)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => ({ ...l, moduleId: mod.id }))
  );
  const nextGlobalLesson = allLessons.find(
    (l) => !completedLessonIds.has(l.id)
  );
  const nextLessonUrl = nextGlobalLesson
    ? `/products/${slug}/lessons/${nextGlobalLesson.id}${previewSuffix}`
    : null;

  return (
    <div className="pb-12">
      {isAdminPreview && (
        <PreviewBanner adminUrl={`/admin/products/${product.id}`} />
      )}
      <div className={isAdminPreview ? 'pt-11' : ''}>
        <ProductHero
          title={product.title}
          description={product.description}
          bannerUrl={product.banner_url}
          totalModules={totalModules}
          totalLessons={totalLessons}
          nextLessonUrl={nextLessonUrl}
          completedLessons={totalCompleted}
        />
        <ModuleList
          modules={modulesWithProgress}
          productSlug={slug}
          grantedAt={grantedAt}
        />
      </div>
    </div>
  );
}
