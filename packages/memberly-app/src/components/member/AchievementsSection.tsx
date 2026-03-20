'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { BadgeCard, type BadgeWithStatus } from '@/components/member/BadgeCard';
import { AchievementsSkeleton } from '@/components/member/AchievementsSkeleton';

export function AchievementsSection() {
  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBadges = () => {
    setLoading(true);
    setError(false);
    fetch('/api/gamification/badges')
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then((data) => setBadges(data.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  if (loading) return <AchievementsSkeleton />;

  if (error) {
    return (
      <section className="px-4 sm:px-8 lg:px-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <Trophy size={20} className="text-primary" />
          Conquistas
        </h2>
        <div className="rounded-xl border border-dark-border bg-dark-card p-8 text-center">
          <p className="text-neutral-400">
            Erro ao carregar conquistas.
          </p>
          <button
            onClick={fetchBadges}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80"
          >
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  if (badges.length === 0) {
    return (
      <section className="px-4 sm:px-8 lg:px-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <Trophy size={20} className="text-primary" />
          Conquistas
        </h2>
        <div className="rounded-xl border border-dark-border bg-dark-card p-8 text-center">
          <p className="text-3xl">🏆</p>
          <p className="mt-2 text-neutral-400">
            Nenhuma conquista disponível ainda.
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Continue estudando para desbloquear badges!
          </p>
        </div>
      </section>
    );
  }

  // Sort: unlocked first, then locked
  const sorted = [...badges].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return 0;
  });

  return (
    <section className="px-4 sm:px-8 lg:px-12">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
        <Trophy size={20} className="text-primary" />
        Conquistas
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </section>
  );
}
