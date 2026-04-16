import { cn } from '@/lib/utils';
import { getHealthScoreColor } from '@/lib/utils';

interface HealthScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function HealthScoreBadge({ score, showLabel = true, size = 'md' }: HealthScoreBadgeProps) {
  const colors = getHealthScoreColor(score);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full',
        colors.bg,
        colors.text,
        sizeClasses[size]
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', colors.text.replace('text-', 'bg-'))} />
      {score}
      {showLabel && (
        <span className="font-normal opacity-75">
          ({score >= 70 ? 'Good' : score >= 40 ? 'At Risk' : 'Critical'})
        </span>
      )}
    </span>
  );
}
