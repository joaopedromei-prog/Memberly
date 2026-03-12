import { createServerSupabaseClient } from '@/lib/supabase/server';
import { HeroBanner, type HeroBannerItem } from '@/components/member/HeroBanner';
import { Carousel } from '@/components/member/Carousel';
import { ProductCard } from '@/components/member/ProductCard';

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

async function getMemberCatalog(): Promise<{
  products: ProductWithProgress[];
  continueWatching: ProductWithProgress[];
  heroItems: HeroBannerItem[];
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { products: [], continueWatching: [], heroItems: [] };
  }

  // Fetch products the member has access to (RLS filters via member_access)
  const { data: memberAccess } = await supabase
    .from('member_access')
    .select('product_id')
    .eq('profile_id', user.id);

  if (!memberAccess || memberAccess.length === 0) {
    return { products: [], continueWatching: [], heroItems: [] };
  }

  const productIds = memberAccess.map((a) => a.product_id);

  const { data: rawProducts } = await supabase
    .from('products')
    .select(`
      id, title, description, banner_url, slug, sort_order,
      modules (
        id,
        lessons ( id )
      )
    `)
    .eq('is_published', true)
    .in('id', productIds)
    .order('sort_order');

  if (!rawProducts || rawProducts.length === 0) {
    return { products: [], continueWatching: [], heroItems: [] };
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

  // Calculate progress per product
  const products: ProductWithProgress[] = rawProducts.map((product) => {
    const allLessons = (product.modules || []).flatMap(
      (m: { id: string; lessons: { id: string }[] }) => m.lessons || []
    );
    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter((l: { id: string }) =>
      completedLessonIds.has(l.id)
    ).length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      bannerUrl: product.banner_url,
      slug: product.slug,
      totalLessons,
      completedLessons,
      progress,
    };
  });

  // Continue watching: started but not finished
  const continueWatching = products.filter(
    (p) => p.progress > 0 && p.progress < 100
  );

  // Hero items: most recent or featured products (first 3)
  const heroItems: HeroBannerItem[] = products.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    bannerUrl: p.bannerUrl,
  }));

  return { products, continueWatching, heroItems };
}

export default async function MemberHomePage() {
  const { products, continueWatching, heroItems } = await getMemberCatalog();

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
      <div className="px-4 sm:px-6 lg:px-16">
        {continueWatching.length > 0 && (
          <Carousel title="Continue Assistindo">
            {continueWatching.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                title={p.title}
                bannerUrl={p.bannerUrl}
                progress={p.progress}
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
      </div>
    </>
  );
}
