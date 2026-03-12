import { ModuleCard } from '@/components/member/ModuleCard';

export interface ModuleWithProgress {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  sortOrder: number;
  totalLessons: number;
  completedLessons: number;
  nextLessonUrl: string | null;
}

interface ModuleListProps {
  modules: ModuleWithProgress[];
  productSlug: string;
}

export function ModuleList({ modules, productSlug }: ModuleListProps) {
  return (
    <section className="mt-8 px-4 sm:px-6 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          Módulos
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          {modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              moduleId={mod.id}
              productSlug={productSlug}
              title={mod.title}
              description={mod.description}
              bannerUrl={mod.bannerUrl}
              totalLessons={mod.totalLessons}
              completedLessons={mod.completedLessons}
              nextLessonUrl={mod.nextLessonUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
