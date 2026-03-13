'use client';

import { motion } from 'motion/react';
import { Users, Activity, CheckCircle, Play } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { NewMembersChart } from '@/components/admin/NewMembersChart';
import { RecentWebhooks } from '@/components/admin/RecentWebhooks';
import { TopLessons } from '@/components/admin/TopLessons';
import { QuickActions } from '@/components/admin/QuickActions';
import { RecentProductsTable } from '@/components/admin/RecentProductsTable';

interface WebhookLog {
  id: string;
  event_type: string;
  status: string;
  created_at: string;
  error_message: string | null;
}

interface TopLesson {
  lesson_title: string;
  product_title: string;
  count: number;
}

interface ChartDataPoint {
  date: string;
  count: number;
}

interface RecentProduct {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  module_count: number;
  lesson_count: number;
}

interface AdminDashboardClientProps {
  totalMembers: number;
  activeMembers30d: number;
  avgCompletion: number;
  totalLessons: number;
  chartData: ChartDataPoint[];
  recentWebhooks: WebhookLog[];
  topLessons: TopLesson[];
  recentProducts: RecentProduct[];
}

const sectionFadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.2, duration: 0.6 },
  },
};

const sectionFadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, duration: 0.5 },
  },
};

export function AdminDashboardClient({
  totalMembers,
  activeMembers30d,
  avgCompletion,
  totalLessons,
  chartData,
  recentWebhooks,
  topLessons,
  recentProducts,
}: AdminDashboardClientProps) {
  const totalNewMembers = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans px-4 py-4 sm:px-8 sm:py-8">
      <div className="w-full flex flex-col gap-8">
        {/* Section 1: Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-slate-900">Dashboard</h1>
            <p className="text-[14px] text-slate-500 mt-1">
              Visão geral da sua plataforma
            </p>
          </div>
        </header>

        {/* Section 2: Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total de Membros"
            value={totalMembers.toLocaleString('pt-BR')}
            icon={
              <Users
                className="w-6 h-6 text-slate-400"
                strokeWidth={1.5}
              />
            }
            index={0}
          />
          <StatCard
            title="Membros Ativos (30d)"
            value={activeMembers30d.toLocaleString('pt-BR')}
            icon={
              <Activity
                className="w-6 h-6 text-blue-500"
                strokeWidth={1.5}
              />
            }
            index={1}
          />
          <StatCard
            title="Taxa de Conclusão"
            value={`${avgCompletion}%`}
            icon={
              <CheckCircle
                className="w-6 h-6 text-violet-500"
                strokeWidth={1.5}
              />
            }
            index={2}
            progress={avgCompletion}
          />
          <StatCard
            title="Aulas Publicadas"
            value={totalLessons.toLocaleString('pt-BR')}
            icon={
              <Play
                className="w-6 h-6 text-slate-400"
                strokeWidth={1.5}
              />
            }
            index={3}
          />
        </section>

        {/* Section 3: Chart + Webhooks */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionFadeIn}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5"
        >
          <div className="lg:col-span-7">
            <NewMembersChart data={chartData} totalNew={totalNewMembers} />
          </div>
          <div className="lg:col-span-5">
            <RecentWebhooks logs={recentWebhooks} />
          </div>
        </motion.section>

        {/* Section 4: Top Lessons + Quick Actions */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionFadeUp}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          <TopLessons lessons={topLessons} />
          <QuickActions />
        </motion.section>

        {/* Section 5: Recent Products Table */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionFadeUp}
        >
          <RecentProductsTable products={recentProducts} />
        </motion.section>
      </div>
    </div>
  );
}
