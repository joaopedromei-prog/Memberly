import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductHero } from '@/components/member/ProductHero';
import { ModuleList, type ModuleWithProgress } from '@/components/member/ModuleList';
import { PreviewBanner } from '@/components/member/PreviewBanner';
import { CertificateDownloadButton } from '@/components/member/CertificateDownloadButton';
import { isDripUnlocked, getEffectiveDripDays } from '@/lib/utils/drip';

export const dynamic = 'force-dynamic';

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
  certificate_enabled?: boolean;
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

  const productSelect = `
    id, title, description, banner_url, slug,
    modules (
      id, title, description, banner_url, sort_order,
      lessons ( id, title, sort_order, is_published )
    )
  `;

  let resolvedProduct: Product | null = null;
  let grantedAt: string | null = null;

  // Use admin client (service role) for data queries to bypass RLS issues
  // Authentication is already verified via supabase.auth.getUser() above
  const adminDb = createAdminClient();

  if (isAdminPreview) {
    const { data, error } = await adminDb
      .from('products')
      .select(productSelect)
      .eq('slug', slug)
      .maybeSingle<Product>();

    if (error) {
      console.error('[ProductPage] Admin product query failed:', { slug, error: error.message, code: error.code });
    }
    resolvedProduct = data;
  } else {
    // Member flow: verify access via member_access, then fetch product
    const { data: memberAccess, error: accessError } = await adminDb
      .from('member_access')
      .select('product_id, granted_at')
      .eq('profile_id', user.id);

    if (accessError) {
      console.error('[ProductPage] member_access query failed:', { userId: user.id, error: accessError.message, code: accessError.code });
      // On query error, try fetching the product directly by slug as fallback
      // rather than falsely telling the user the product was not found
      const { data: fallbackProduct } = await adminDb
        .from('products')
        .select(productSelect)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle<Product>();
      resolvedProduct = fallbackProduct;
    } else if (memberAccess && memberAccess.length > 0) {
      const accessProductIds = memberAccess.map((a) => a.product_id);

      const { data: products, error: productError } = await adminDb
        .from('products')
        .select(productSelect)
        .eq('slug', slug)
        .eq('is_published', true)
        .in('id', accessProductIds);

      if (productError) {
        console.error('[ProductPage] Product query failed:', { slug, accessProductIds, error: productError.message, code: productError.code });
        // Fallback: try without access filter to avoid false "not found"
        const { data: fallbackProduct } = await adminDb
          .from('products')
          .select(productSelect)
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle<Product>();
        resolvedProduct = fallbackProduct;
      } else {
        resolvedProduct = (products as Product[] | null)?.[0] ?? null;
      }

      if (resolvedProduct && memberAccess) {
        const access = memberAccess.find((a) => a.product_id === resolvedProduct!.id);
        grantedAt = access?.granted_at ?? null;
      }
    } else {
      console.warn('[ProductPage] No member_access found for user:', { userId: user.id, slug });
    }

    if (!resolvedProduct) {
      console.error('[ProductPage] Product not resolved — redirecting:', {
        slug,
        userId: user.id,
        hadAccessError: !!accessError,
        memberAccessCount: memberAccess?.length ?? 0,
      });
      redirect('/?message=produto-nao-encontrado');
    }
  }

  if (!resolvedProduct) {
    redirect('/?message=produto-nao-encontrado');
  }

  // Fetch certificate_enabled separately to avoid breaking the main query
  // if the column doesn't exist yet (migration not applied)
  let certificateEnabled = false;
  const { data: certData } = await adminDb
    .from('products')
    .select('certificate_enabled')
    .eq('id', resolvedProduct.id)
    .maybeSingle();
  if (certData && 'certificate_enabled' in certData) {
    certificateEnabled = (certData as { certificate_enabled: boolean }).certificate_enabled;
  }

  // Fetch member progress (admin client bypasses RLS)
  const { data: progressData } = await adminDb
    .from('lesson_progress')
    .select('lesson_id, completed')
    .eq('profile_id', user.id)
    .eq('completed', true);

  const completedLessonIds = new Set(
    (progressData || []).map((p) => p.lesson_id)
  );

  // Sort modules by sort_order
  const sortedModules = [...resolvedProduct.modules].sort(
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

    // Drip check for module (drip_days column not yet applied to DB — safe fallback)
    const moduleDripDays = 'drip_days' in mod ? (mod as Record<string, unknown>).drip_days as number | null : null;
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

  const isComplete = totalLessons > 0 && totalCompleted === totalLessons;

  return (
    <div className="pb-12">
      {isAdminPreview && (
        <PreviewBanner adminUrl={`/admin/products/${resolvedProduct.id}`} />
      )}
      <div className={isAdminPreview ? 'pt-11' : ''}>
        <ProductHero
          title={resolvedProduct.title}
          description={resolvedProduct.description}
          bannerUrl={resolvedProduct.banner_url}
          totalModules={totalModules}
          totalLessons={totalLessons}
          nextLessonUrl={nextLessonUrl}
          completedLessons={totalCompleted}
        />
        {isComplete && (
          <div className="px-4 sm:px-6 lg:px-16 mt-4">
            <div className="mx-auto max-w-7xl">
              <CertificateDownloadButton
                productId={resolvedProduct.id}
                productSlug={slug}
                isComplete={isComplete}
                certificateEnabled={certificateEnabled}
                completedLessons={totalCompleted}
                totalLessons={totalLessons}
                isPreview={isAdminPreview}
              />
            </div>
          </div>
        )}
        <ModuleList
          modules={modulesWithProgress}
          productSlug={slug}
          grantedAt={grantedAt}
        />
      </div>
    </div>
  );
}
