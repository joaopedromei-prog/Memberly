import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductHero } from '@/components/member/ProductHero';
import { ModuleList, type ModuleWithProgress } from '@/components/member/ModuleList';
import { PreviewBanner } from '@/components/member/PreviewBanner';

interface Lesson {
  id: string;
  title: string;
  sort_order: number;
  is_published: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  sort_order: number;
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
        id, title, description, banner_url, sort_order,
        lessons ( id, title, sort_order, is_published )
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

  // Verify access (skip for admin preview)
  if (!isAdminPreview) {
    const { data: accessCheck } = await supabase
      .from('member_access')
      .select('product_id, products!inner(slug)')
      .eq('profile_id', user.id);

    const hasAccess = accessCheck?.some((a) => a.product_id === product.id);
    if (!hasAccess) {
      redirect('/?message=sem-acesso');
    }
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
  // In admin preview, include draft lessons with badge
  const previewSuffix = isAdminPreview ? '?preview=true' : '';

  const modulesWithProgress: ModuleWithProgress[] = sortedModules.map((mod) => {
    const sortedLessons = [...mod.lessons]
      .filter((l) => isAdminPreview || l.is_published)
      .sort((a, b) => a.sort_order - b.sort_order);
    const totalLessons = sortedLessons.length;
    const completedLessons = sortedLessons.filter((l) =>
      completedLessonIds.has(l.id)
    ).length;

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
    };
  });

  // Global stats
  const totalModules = modulesWithProgress.length;
  const totalLessons = modulesWithProgress.reduce(
    (sum, m) => sum + m.totalLessons,
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
        />
        <ModuleList modules={modulesWithProgress} productSlug={slug} />
      </div>
    </div>
  );
}
