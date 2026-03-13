'use client';

import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  index: number;
  trend?: string;
  trendColor?: 'emerald' | 'slate';
  progress?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.25, 0.4, 0, 1] as [number, number, number, number],
    },
  }),
};

export function StatCard({
  title,
  value,
  icon,
  index,
  trend,
  trendColor = 'emerald',
  progress,
}: StatCardProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-[14px] font-medium text-slate-500 uppercase tracking-[0.05em]">
          {title}
        </h3>
      </div>
      <div className="text-[32px] font-bold text-slate-900 mb-2">{value}</div>
      {progress !== undefined && (
        <div className="w-full h-1.5 rounded-full bg-slate-100 mb-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {trend && (
        <div
          className={`inline-flex items-center text-[12px] font-medium rounded-full px-2 py-0.5 ${
            trendColor === 'emerald'
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-slate-500'
          }`}
        >
          {trend}
        </div>
      )}
    </motion.div>
  );
}
