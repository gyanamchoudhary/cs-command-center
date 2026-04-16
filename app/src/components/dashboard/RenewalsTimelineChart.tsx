import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardMetrics } from '@/data/sampleData';

const data = [
  { period: '30 Days', count: dashboardMetrics.upcoming_renewals_30d },
  { period: '60 Days', count: dashboardMetrics.upcoming_renewals_60d },
  { period: '90 Days', count: dashboardMetrics.upcoming_renewals_90d },
];

export function RenewalsTimelineChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Renewals</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="period" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: number) => [`${value} renewals`, '']}
            />
            <Bar 
              dataKey="count" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.period} className="text-center">
            <p className="text-2xl font-bold text-blue-600">{item.count}</p>
            <p className="text-xs text-gray-500">{item.period}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
