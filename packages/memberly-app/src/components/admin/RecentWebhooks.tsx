import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface WebhookLog {
  id: string;
  event_type: string;
  status: string;
  created_at: string;
  error_message: string | null;
}

interface RecentWebhooksProps {
  logs: WebhookLog[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

const statusDotColor: Record<string, string> = {
  processed: 'bg-emerald-600',
  failed: 'bg-red-600',
  ignored: 'bg-slate-400',
};

export function RecentWebhooks({ logs }: RecentWebhooksProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
        <h2 className="text-[18px] font-semibold text-slate-900 mb-6">
          Webhooks Recentes
        </h2>
        <p className="text-sm text-slate-500">Nenhum webhook registrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <h2 className="text-[18px] font-semibold text-slate-900 mb-6">
        Webhooks Recentes
      </h2>
      <div className="flex-1 space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  statusDotColor[log.status] ?? statusDotColor.ignored
                }`}
              />
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-slate-700 truncate max-w-[160px] sm:max-w-[200px]">
                  {log.event_type}
                </p>
                <p className="text-[12px] text-slate-400">{log.status}</p>
              </div>
            </div>
            <div className="text-[12px] text-slate-400 whitespace-nowrap ml-4">
              {timeAgo(log.created_at)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100">
        <Link
          href="/admin/webhooks"
          className="text-[14px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          Ver todos os logs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
