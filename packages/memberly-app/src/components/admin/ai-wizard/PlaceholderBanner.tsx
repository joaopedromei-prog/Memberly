'use client';

const GRADIENTS = [
  'from-purple-500 to-indigo-600',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-green-500',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-500',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

interface PlaceholderBannerProps {
  title: string;
  className?: string;
}

export function PlaceholderBanner({ title, className = '' }: PlaceholderBannerProps) {
  const gradientIndex = hashString(title) % GRADIENTS.length;
  const gradient = GRADIENTS[gradientIndex];

  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${gradient} aspect-video ${className}`}
    >
      <span className="max-w-[80%] truncate text-center text-xs font-semibold text-white/90">
        {title}
      </span>
    </div>
  );
}
