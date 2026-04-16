import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { healthDistribution } from '@/data/sampleData';

const data = [
  { name: 'Green', value: healthDistribution.green, color: '#10b981' },
  { name: 'Yellow', value: healthDistribution.yellow, color: '#f59e0b' },
  { name: 'Red', value: healthDistribution.red, color: '#ef4444' },
];

export function HealthDistributionChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} accounts (${((value / total) * 100).toFixed(1)}%)`, '']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <p className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
            <p className="text-xs text-gray-500">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
