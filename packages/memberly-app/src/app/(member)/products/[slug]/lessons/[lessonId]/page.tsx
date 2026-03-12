import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { VideoPlayer } from '@/components/shared/VideoPlayer';
import { LessonLayout } from '@/components/member/LessonLayout';
import { LessonInfo } from '@/components/member/LessonInfo';
import { LessonSidebar, type SidebarLesson } from '@/components/member/LessonSidebar';
import { CommentSection } from '@/components/shared/CommentSection';

interface LessonRow {
  id: string;
  title: string;
  sort_order: number;
  duration_minutes: number | null;
}

interface LessonDetail {
  id: string;
  title: string;
  description: string;
  video_provider: 'youtube' | 'pandavideo';
  video_id: string;
  pdf_url: string | null;
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
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch lesson with module and product context
  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      id, title, description, video_provider, video_id, pdf_url,
      sort_order, duration_minutes,
      module:modules!inner (
        id, title, product_id,
        product:products!inner ( id, title, slug ),
        lessons ( id, title, sort_order, duration_minutes )
      )
    `)
    .eq('id', lessonId)
    .single<LessonDetail>();

  if (!lesson || lesson.module.product.slug !== slug) {
    redirect('/?message=aula-nao-encontrada');
  }

  // Verify member access
  const { data: access } = await supabase
    .from('member_access')
    .select('id')
    .eq('profile_id', user.id)
    .eq('product_id', lesson.module.product_id)
    .maybeSingle();

  if (!access) {
    redirect('/?message=sem-acesso');
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

  // Sort module lessons by sort_order
  const sortedLessons = [...lesson.module.lessons].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  // Current lesson index for prev/next navigation
  const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const prevLessonUrl = prevLesson
    ? `/products/${slug}/lessons/${prevLesson.id}`
    : null;
  const nextLessonUrl = nextLesson
    ? `/products/${slug}/lessons/${nextLesson.id}`
    : null;

  // Build sidebar lessons
  const sidebarLessons: SidebarLesson[] = sortedLessons.map((l) => ({
    id: l.id,
    title: l.title,
    durationMinutes: l.duration_minutes,
    completed: completedLessonIds.has(l.id),
  }));

  const completedCount = sidebarLessons.filter((l) => l.completed).length;

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: lesson.module.product.title, href: `/products/${slug}` },
    { label: lesson.module.title },
    { label: lesson.title },
  ];

  return (
    <div className="mx-auto max-w-7xl py-4 lg:px-6">
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
            isCompleted={completedLessonIds.has(lesson.id)}
            prevLessonUrl={prevLessonUrl}
            nextLessonUrl={nextLessonUrl}
            breadcrumbs={breadcrumbs}
          />
        }
        comments={
          <CommentSection lessonId={lesson.id} />
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
  );
}
