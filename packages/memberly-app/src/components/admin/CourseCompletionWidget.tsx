'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, PlayCircle, Clock } from 'lucide-react';

interface CourseCompletionWidgetProps {
  totalModules: number;
  totalLessons: number;
  publishedLessons: number;
  totalDurationMinutes: number;
}

function CircularProgress({ percentage }: { percentage: number }) {
  const [offset, setOffset] = useState(100);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(100 - percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          className="stroke-slate-200"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          className="stroke-emerald-500 transition-all duration-1000 ease-out"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={(circumference * offset) / 100}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-900">{percentage}%</span>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return '0min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export function CourseCompletionWidget({
  totalModules,
  totalLessons,
  publishedLessons,
  totalDurationMinutes,
}: CourseCompletionWidgetProps) {
  const percentage = totalLessons > 0
    ? Math.round((publishedLessons / totalLessons) * 100)
    : 0;

  if (totalLessons === 0 && totalModules === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <CircularProgress percentage={percentage} />
        <div>
          <div className="text-sm font-semibold text-slate-900">{percentage}% concluído</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {publishedLessons} de {totalLessons} aulas publicadas
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:flex gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          <LayoutGrid size={18} className="text-slate-400" />
          <span className="text-sm text-slate-600">{totalModules} módulos</span>
        </div>
        <div className="flex items-center gap-2">
          <PlayCircle size={18} className="text-slate-400" />
          <span className="text-sm text-slate-600">{totalLessons} aulas</span>
        </div>
        {totalDurationMinutes > 0 && (
          <div className="flex items-center gap-2 col-span-2 md:col-span-1">
            <Clock size={18} className="text-slate-400" />
            <span className="text-sm text-slate-600">{formatDuration(totalDurationMinutes)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
