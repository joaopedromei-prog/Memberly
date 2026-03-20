'use client';

import { cn } from '@/lib/utils/cn';

export interface BadgeWithStatus {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  unlocked: boolean;
  unlocked_at: string | null;
}

interface BadgeCardProps {
  badge: BadgeWithStatus;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-dark-card p-4 text-center transition-all duration-300',
        badge.unlocked
          ? 'border-primary/30 shadow-lg shadow-primary/10'
          : 'border-dark-border opacity-50 grayscale'
      )}
      data-testid={`badge-card-${badge.id}`}
    >
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-dark-surface text-3xl">
        {badge.icon_url ? (
          <img
            src={badge.icon_url}
            alt={badge.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span role="img" aria-label="badge">🏅</span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-white">{badge.name}</h3>
      <p className="mt-1 text-xs text-gray-400">{badge.description}</p>
      {badge.unlocked && badge.unlocked_at && (
        <p className="mt-2 text-xs text-primary">
          Desbloqueado em{' '}
          {new Date(badge.unlocked_at).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  );
}
