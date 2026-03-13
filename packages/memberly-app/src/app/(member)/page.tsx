import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { HeroBanner, type HeroBannerItem } from '@/components/member/HeroBanner';

export const dynamic = 'force-dynamic';
import { Carousel } from '@/components/member/Carousel';
import { ProductCard } from '@/components/member/ProductCard';
import { ContinueWatchingCard } from '@/components/member/ContinueWatchingCard';
import { BookmarkCard } from '@/components/member/BookmarkCard';
import { Heart } from 'lucide-react';

interface ProductWithProgress {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  slug: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

interface ContinueWatchingItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  productBannerUrl: string | null;
  targetLessonId: string;
  targetLessonTitle: string;
  moduleName: string;
  lastWatchedAt: string | null;
  isContinue: boolean;
  progress: number;
}

interface BookmarkItem {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  productTitle: string;
  productSlug: string;
  durationMinutes: number | null;
}

async function getMemberCatalog(): Promise<{
  products: ProductWithProgress[];
  continueWatching: ContinueWatchingItem[];
  bookmarks: BookmarkItem[];
  heroItems: HeroBannerItem[];
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { products: [], continueWatching: [], bookmarks: [], heroItems: [] };
  }

  // Use admin client for data queries to bypass RLS issues
  const adminDb = createAdminClient();

  const { data: memberAccess } = await adminDb
    .from('member_access')
    .select('product_id')
    .eq('profile_id', user.id);

  if (!memberAccess || memberAccess.length === 0) {
    return { products: [], continueWatching: [], bookmarks: [], heroItems: [] };
  }

  const productIds = memberAccess.map((a) => a.product_id);

  const { data: rawProducts } = await adminDb
    .from('products')
    .select(`
      id, title, description, banner_url, slug, sort_order,
      modules (
        id, title, sort_order,
        lessons ( id, title, sort_order, is_published )
      )
    `)
    .eq('is_published', true)
    .in('id', productIds)
    .order('sort_order');

  if (!rawProducts || rawProducts.length === 0) {
    return { products: [], continueWatching: [], bookmarks: [], heroItems: [] };
  }

  const { data: progressData } = await adminDb
    .from('lesson_progress')
    .select('lesson_id, completed, last_watched_at')
    .eq('profile_id', user.id);

  const progressMap = new Map<string, { completed: boolean; last_watched_at: string | null }>();
  for (const p of progressData || []) {
    progressMap.set(p.lesson_id, { completed: p.completed, last_watched_at: p.last_watched_at });
  }

  const completedLessonIds = new Set(
    (progressData || []).filter((p) => p.completed).map((p) => p.lesson_id)
  );

  interface RawModule {
    id: string;
    title: string;
    sort_order: number;
    lessons: { id: string; title: string; sort_order: number; is_published: boolean }[];
  }

  const products: ProductWithProgress[] = [];
  const continueWatching: ContinueWatchingItem[] = [];

  for (const product of rawProducts) {
    const modules = (product.modules || []) as RawModule[];
    const sortedModules = [...modules].sort((a, b) => a.sort_order - b.sort_order);

    const allLessons = sortedModules.flatMap((m) =>
      [...(m.lessons || [])].filter((l) => l.is_published).sort((a, b) => a.sort_order - b.sort_order).map((l) => ({
        ...l,
        moduleTitle: m.title,
      }))
    );

    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    products.push({
      id: product.id,
      title: product.title,
      description: product.description,
      bannerUrl: product.banner_url,
      slug: product.slug,
      totalLessons,
      completedLessons,
      progress,
    });

    if (progress > 0 && progress < 100) {
      let lastWatchedLesson: typeof allLessons[0] | null = null;
      let lastWatchedAt: string | null = null;

      for (const lesson of allLessons) {
        const prog = progressMap.get(lesson.id);
        if (prog?.last_watched_at) {
          if (!lastWatchedAt || prog.last_watched_at > lastWatchedAt) {
            lastWatchedAt = prog.last_watched_at;
            lastWatchedLesson = lesson;
          }
        }
      }

      const lastWasCompleted = lastWatchedLesson ? completedLessonIds.has(lastWatchedLesson.id) : true;
      let targetLesson: typeof allLessons[0] | null = null;
      let isContinue = false;

      if (lastWatchedLesson && !lastWasCompleted) {
        targetLesson = lastWatchedLesson;
        isContinue = true;
      } else {
        targetLesson = allLessons.find((l) => !completedLessonIds.has(l.id)) || null;
        isContinue = false;
      }

      if (targetLesson) {
        continueWatching.push({
          productId: product.id,
          productTitle: product.title,
          productSlug: product.slug,
          productBannerUrl: product.banner_url,
          targetLessonId: targetLesson.id,
          targetLessonTitle: targetLesson.title,
          moduleName: targetLesson.moduleTitle,
          lastWatchedAt,
          isContinue,
          progress,
        });
      }
    }
  }

  continueWatching.sort((a, b) => {
    if (!a.lastWatchedAt && !b.lastWatchedAt) return 0;
    if (!a.lastWatchedAt) return 1;
    if (!b.lastWatchedAt) return -1;
    return b.lastWatchedAt.localeCompare(a.lastWatchedAt);
  });

  const { data: bookmarkData } = await adminDb
    .from('lesson_bookmarks')
    .select(`
      id, created_at,
      lesson:lessons!inner (
        id, title, duration_minutes,
        module:modules!inner (
          title,
          product:products!inner ( title, slug )
        )
      )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  interface BookmarkRow {
    id: string;
    created_at: string;
    lesson: {
      id: string;
      title: string;
      duration_minutes: number | null;
      module: {
        title: string;
        product: { title: string; slug: string };
      };
    };
  }

  const bookmarks: BookmarkItem[] = ((bookmarkData || []) as unknown as BookmarkRow[]).map((b) => ({
    lessonId: b.lesson.id,
    lessonTitle: b.lesson.title,
    moduleTitle: b.lesson.module.title,
    productTitle: b.lesson.module.product.title,
    productSlug: b.lesson.module.product.slug,
    durationMinutes: b.lesson.duration_minutes,
  }));

  // Build hero items with context from continue watching
  const heroItems: HeroBannerItem[] = products.slice(0, 3).map((p) => {
    const cw = continueWatching.find((c) => c.productId === p.id);
    return {
      slug: p.slug,
      title: p.title,
      description: p.description,
      bannerUrl: p.bannerUrl,
      context: p.progress > 0
        ? `${cw?.moduleName || ''} · ${cw?.targetLessonTitle || ''} · ${p.progress}% concluído`.replace(/^ · /, '')
        : undefined,
      lessonUrl: cw
        ? `/products/${p.slug}/lessons/${cw.targetLessonId}`
        : undefined,
    };
  });

  return { products, continueWatching, bookmarks, heroItems };
}

export default async function MemberHomePage() {
  const { products, continueWatching, bookmarks, heroItems } = await getMemberCatalog();

  if (products.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-xl font-semibold text-white">
          Você ainda não tem cursos.
        </p>
        <p className="mt-2 text-neutral-400">
          Entre em contato com o suporte para obter acesso.
        </p>
      </div>
    );
  }

  return (
    <>
      <HeroBanner items={heroItems} />
      <div className="mt-[-8vw] sm:mt-[-6vw] lg:mt-[-4vw] relative z-20 space-y-2 sm:space-y-4 lg:space-y-8">
        {continueWatching.length > 0 && (
          <Carousel title="Continue Assistindo">
            {continueWatching.map((item) => (
              <ContinueWatchingCard
                key={item.productId}
                productSlug={item.productSlug}
                productTitle={item.productTitle}
                productBannerUrl={item.productBannerUrl}
                targetLessonId={item.targetLessonId}
                targetLessonTitle={item.targetLessonTitle}
                moduleName={item.moduleName}
                lastWatchedAt={item.lastWatchedAt}
                isContinue={item.isContinue}
                progressPercent={item.progress}
              />
            ))}
          </Carousel>
        )}

        <Carousel title="Meus Cursos">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              title={p.title}
              bannerUrl={p.bannerUrl}
              progress={p.progress}
            />
          ))}
        </Carousel>

        {bookmarks.length > 0 && (
          <Carousel
            title="Favoritos"
            icon={<Heart size={20} className="text-neutral-500" />}
          >
            {bookmarks.map((b) => (
              <BookmarkCard
                key={b.lessonId}
                lessonId={b.lessonId}
                lessonTitle={b.lessonTitle}
                moduleTitle={b.moduleTitle}
                productTitle={b.productTitle}
                productSlug={b.productSlug}
                durationMinutes={b.durationMinutes}
              />
            ))}
          </Carousel>
        )}
      </div>
    </>
  );
}
