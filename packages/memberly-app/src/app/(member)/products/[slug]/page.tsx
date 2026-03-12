import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductHero } from '@/components/member/ProductHero';
import { ModuleList, type ModuleWithProgress } from '@/components/member/ModuleList';

interface Lesson {
  id: string;
  title: string;
  sort_order: number;
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check member access + fetch product with modules and lessons
  const { data: accessCheck } = await supabase
    .from('member_access')
    .select('product_id, products!inner(slug)')
    .eq('profile_id', user.id);

  const { data: product } = await supabase
    .from('products')
    .select(`
      id, title, description, banner_url, slug,
      modules (
        id, title, description, banner_url, sort_order,
        lessons ( id, title, sort_order )
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single<Product>();

  if (!product) {
    redirect('/?message=produto-nao-encontrado');
  }

  // Verify access
  const hasAccess = accessCheck?.some((a) => a.product_id === product.id);
  if (!hasAccess) {
    redirect('/?message=sem-acesso');
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
  const modulesWithProgress: ModuleWithProgress[] = sortedModules.map((mod) => {
    const sortedLessons = [...mod.lessons].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    const totalLessons = sortedLessons.length;
    const completedLessons = sortedLessons.filter((l) =>
      completedLessonIds.has(l.id)
    ).length;

    const nextLesson = sortedLessons.find(
      (l) => !completedLessonIds.has(l.id)
    );
    const nextLessonUrl = nextLesson
      ? `/products/${slug}/lessons/${nextLesson.id}`
      : null;

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
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
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => ({ ...l, moduleId: mod.id }))
  );
  const nextGlobalLesson = allLessons.find(
    (l) => !completedLessonIds.has(l.id)
  );
  const nextLessonUrl = nextGlobalLesson
    ? `/products/${slug}/lessons/${nextGlobalLesson.id}`
    : null;

  return (
    <div className="pb-12">
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
  );
}
