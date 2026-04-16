import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  type: 'currency' | 'number' | 'percentage';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export function KPICard({
  title,
  value,
  type,
  trend,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
}: KPICardProps) {
  const formatValue = () => {
    switch (type) {
      case 'currency':
        return formatCurrency(value, { compact: value >= 1000000 });
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{formatValue()}</p>
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {formatPercentage(trend.value)}
              </span>
              {trend.label && (
                <span className="text-sm text-gray-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={cn('p-3 rounded-lg', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
}
