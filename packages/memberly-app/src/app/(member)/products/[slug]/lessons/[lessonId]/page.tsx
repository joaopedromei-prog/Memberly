import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { VideoPlayer } from '@/components/shared/VideoPlayer';
import { LessonLayout } from '@/components/member/LessonLayout';
import { LessonInfo } from '@/components/member/LessonInfo';
import { LessonNavigation } from '@/components/member/LessonNavigation';
import { LessonSidebar, type SidebarLesson } from '@/components/member/LessonSidebar';
import { CommentSection } from '@/components/shared/CommentSection';
import { PreviewBanner } from '@/components/member/PreviewBanner';
import type { LessonAttachment } from '@/types/database';

interface LessonRow {
  id: string;
  title: string;
  sort_order: number;
  duration_minutes: number | null;
  is_published: boolean;
}

interface LessonDetail {
  id: string;
  title: string;
  description: string;
  video_provider: 'youtube' | 'pandavideo';
  video_id: string;
  pdf_url: string | null;
  attachments: LessonAttachment[] | null;
  sort_order: number;
  duration_minutes: number | null;
  module: {
    id: string;
    title: string;
    product_id: string;
    product: { id: string; title: string; slug: string };
    lessons: LessonRow[];
  };
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug, lessonId } = await params;
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

  // Fetch lesson with module and product context
  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      id, title, description, video_provider, video_id, pdf_url, attachments,
      sort_order, duration_minutes,
      module:modules!inner (
        id, title, product_id,
        product:products!inner ( id, title, slug ),
        lessons ( id, title, sort_order, duration_minutes, is_published )
      )
    `)
    .eq('id', lessonId)
    .single<LessonDetail>();

  if (!lesson || lesson.module.product.slug !== slug) {
    redirect('/?message=aula-nao-encontrada');
  }

  // Verify member access (skip for admin preview)
  if (!isAdminPreview) {
    const { data: access } = await supabase
      .from('member_access')
      .select('id')
      .eq('profile_id', user.id)
      .eq('product_id', lesson.module.product_id)
      .maybeSingle();

    if (!access) {
      redirect('/?message=sem-acesso');
    }
  }

  // Fetch progress for all lessons in this module
  const moduleLessonIds = lesson.module.lessons.map((l) => l.id);
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed')
    .eq('profile_id', user.id)
    .in('lesson_id', moduleLessonIds);

  const completedLessonIds = new Set(
    (progressData || []).filter((p) => p.completed).map((p) => p.lesson_id)
  );

  // Sort module lessons by sort_order (in admin preview, include drafts)
  const previewSuffix = isAdminPreview ? '?preview=true' : '';

  const sortedLessons = [...lesson.module.lessons]
    .filter((l) => isAdminPreview || l.is_published)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Current lesson index for prev/next navigation
  const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const prevLessonUrl = prevLesson
    ? `/products/${slug}/lessons/${prevLesson.id}${previewSuffix}`
    : null;
  const nextLessonUrl = nextLesson
    ? `/products/${slug}/lessons/${nextLesson.id}${previewSuffix}`
    : null;

  // Build sidebar lessons (show draft badge in preview)
  const sidebarLessons: SidebarLesson[] = sortedLessons.map((l) => ({
    id: l.id,
    title: isAdminPreview && !l.is_published ? `${l.title} [Rascunho]` : l.title,
    durationMinutes: l.duration_minutes,
    completed: completedLessonIds.has(l.id),
  }));

  const completedCount = sidebarLessons.filter((l) => l.completed).length;

  // Breadcrumbs
  const productUrl = isAdminPreview
    ? `/products/${slug}?preview=true`
    : `/products/${slug}`;
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: lesson.module.product.title, href: productUrl },
    { label: lesson.module.title },
    { label: lesson.title },
  ];

  return (
    <div>
      {isAdminPreview && (
        <PreviewBanner adminUrl={`/admin/products/${lesson.module.product.id}`} />
      )}
      <div className={`mx-auto max-w-7xl bg-[#141414] py-4 lg:px-6 ${isAdminPreview ? 'pt-14' : ''}`}>
        <LessonLayout
          player={
            <VideoPlayer
              provider={lesson.video_provider}
              videoId={lesson.video_id}
              title={lesson.title}
            />
          }
          info={
            <LessonInfo
              lessonId={lesson.id}
              title={lesson.title}
              description={lesson.description}
              durationMinutes={lesson.duration_minutes}
              pdfUrl={lesson.pdf_url}
              attachments={lesson.attachments ?? []}
              isCompleted={completedLessonIds.has(lesson.id)}
              breadcrumbs={breadcrumbs}
            />
          }
          comments={
            <CommentSection lessonId={lesson.id} />
          }
          navigation={
            <LessonNavigation
              prevLessonUrl={prevLessonUrl}
              nextLessonUrl={nextLessonUrl}
            />
          }
          sidebar={
            <LessonSidebar
              moduleName={lesson.module.title}
              productSlug={slug}
              lessons={sidebarLessons}
              currentLessonId={lessonId}
              completedCount={completedCount}
            />
          }
        />
      </div>
    </div>
  );
}
