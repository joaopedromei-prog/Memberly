import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}
