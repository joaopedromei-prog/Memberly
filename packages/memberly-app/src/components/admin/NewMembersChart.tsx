'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  count: number;
}

interface NewMembersChartProps {
  data: ChartDataPoint[];
  totalNew: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white rounded-lg shadow-xl px-3 py-2 text-sm border border-slate-800">
        <p className="font-medium mb-1 text-slate-300">{label}</p>
        <p className="text-white">
          <span className="font-semibold">{payload[0].value}</span> novos membros
        </p>
      </div>
    );
  }
  return null;
}

export function NewMembersChart({ data, totalNew }: NewMembersChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Sem dados disponíveis.</p>;
  }

  // Format dates for display
  const chartData = data.map((d) => ({
    date: d.date.slice(5).replace('-', '/'),
    members: d.count,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-semibold text-slate-900">
            Novos Membros
          </h2>
          <p className="text-[12px] font-medium text-slate-500">
            Últimos 30 dias
          </p>
        </div>
        <div className="inline-flex items-center text-[12px] font-medium text-blue-700 bg-blue-50 rounded-full px-3 py-1">
          {totalNew} novos
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickMargin={12}
              interval={4}
            />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: '#E2E8F0',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />
            <Area
              type="monotone"
              dataKey="members"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMembers)"
              activeDot={{
                r: 4,
                fill: '#2563EB',
                stroke: '#FFFFFF',
                strokeWidth: 2,
              }}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
