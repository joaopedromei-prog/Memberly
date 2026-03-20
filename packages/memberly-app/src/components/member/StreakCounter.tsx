'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/Skeleton';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

const MILESTONES = [7, 30];

export function StreakCounterSkeleton() {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-card p-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="text" className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton variant="text" className="h-8 w-16" />
          <Skeleton variant="text" className="mt-1 h-4 w-32" />
        </div>
      </div>
      <Skeleton variant="text" className="mt-3 h-3 w-24" />
    </div>
  );
}

export function StreakCounter() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gamification/streak')
      .then((res) => res.json())
      .then((data) => setStreak(data.data))
      .catch(() => setStreak(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StreakCounterSkeleton />;
  if (!streak) return null;

  const isMilestone = MILESTONES.includes(streak.current_streak);

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card p-6">
      <div className="flex items-center gap-4">
        <motion.div
          className="text-4xl"
          animate={
            isMilestone
              ? {
                  scale: [1, 1.2, 1],
                  filter: [
                    'brightness(1)',
                    'brightness(1.5)',
                    'brightness(1)',
                  ],
                }
              : {}
          }
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          data-testid="streak-icon"
        >
          🔥
        </motion.div>
        <div>
          {streak.current_streak > 0 ? (
            <>
              <p className="text-3xl font-bold text-white" data-testid="streak-count">
                {streak.current_streak}
              </p>
              <p className="text-sm text-gray-400">dias consecutivos</p>
            </>
          ) : (
            <p className="text-sm text-gray-400" data-testid="streak-zero-message">
              Comece sua sequência hoje!
            </p>
          )}
        </div>
      </div>
      {streak.longest_streak > 0 && (
        <p className="mt-3 text-xs text-gray-500" data-testid="streak-record">
          Recorde: {streak.longest_streak} dias
        </p>
      )}
    </div>
  );
}
