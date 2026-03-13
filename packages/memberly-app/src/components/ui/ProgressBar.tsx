import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, showLabel, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const isComplete = clamped === 100;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-dark-border">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-in-out',
            isComplete ? 'bg-accent-success' : 'bg-primary'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-neutral-400">{clamped}%</span>
      )}
    </div>
  );
}
