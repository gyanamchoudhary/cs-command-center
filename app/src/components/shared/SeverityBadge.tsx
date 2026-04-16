import { cn } from '@/lib/utils';
import { getSeverityColor } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityBadge({ severity, showLabel = true, size = 'md' }: SeverityBadgeProps) {
  const colors = getSeverityColor(severity);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full uppercase tracking-wide',
        colors.bg,
        colors.text,
        sizeClasses[size]
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
      {showLabel && severity}
    </span>
  );
}
