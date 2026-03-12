import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5', className)}
      {...props}
    >
      {children}
    </div>
  );
}
