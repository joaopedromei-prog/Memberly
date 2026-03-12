import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'primary' &&
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        variant === 'outline' &&
          'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        (disabled || isLoading) && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Carregando...' : children}
    </button>
  );
}
