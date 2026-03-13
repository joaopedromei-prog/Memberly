'use client';

import { motion } from 'motion/react';
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
  isLocked?: boolean;
  effectiveDripDays?: number;
}

interface ModuleListProps {
  modules: ModuleWithProgress[];
  productSlug: string;
  grantedAt?: string | null;
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export function ModuleList({
  modules,
  productSlug,
  grantedAt,
}: ModuleListProps) {
  return (
    <section className="mt-10 px-4 sm:px-6 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-[24px] font-semibold text-white mb-5">Módulos</h2>
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          {modules.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              moduleId={mod.id}
              productSlug={productSlug}
              title={mod.title}
              description={mod.description}
              bannerUrl={mod.bannerUrl}
              totalLessons={mod.totalLessons}
              completedLessons={mod.completedLessons}
              nextLessonUrl={mod.isLocked ? null : mod.nextLessonUrl}
              isLocked={mod.isLocked}
              grantedAt={grantedAt}
              effectiveDripDays={mod.effectiveDripDays}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
