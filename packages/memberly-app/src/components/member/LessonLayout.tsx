'use client';

import { motion } from 'motion/react';

interface LessonLayoutProps {
  player: React.ReactNode;
  info: React.ReactNode;
  comments?: React.ReactNode;
  navigation?: React.ReactNode;
  sidebar: React.ReactNode;
}

export function LessonLayout({ player, info, comments, navigation, sidebar }: LessonLayoutProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left column: video, info, navigation, comments — flex-1 on desktop */}
      <div className="min-w-0 flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {player}
        </motion.div>
        <div className="px-4 pb-8 sm:px-6 lg:px-0">
          {info}
          {navigation}
          {comments}
        </div>
      </div>

      {/* Right column: lesson sidebar — 30% on desktop, sticky */}
      <div className="w-full shrink-0 px-4 pb-8 sm:px-6 lg:w-[30%] lg:px-0">
        <div className="lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-100px)]">
          {sidebar}
        </div>
      </div>
    </div>
  );
}
