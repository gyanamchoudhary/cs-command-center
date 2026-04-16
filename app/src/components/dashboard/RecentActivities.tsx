import { activities, accounts, users } from '@/data/sampleData';
import { getRelativeTime, getActivityTypeLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

export function RecentActivities() {
  const recentActivities = activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown';
  };

  const getUserName = (userId?: string) => {
    if (!userId) return 'System';
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
  };

  const getIconComponent = (type: string) => {
    const icons: Record<string, string> = {
      call: 'Phone',
      meeting: 'Users',
      email: 'Mail',
      follow_up: 'ArrowRight',
      internal_discussion: 'MessageSquare',
      qbr: 'Presentation',
      escalation: 'AlertTriangle',
      note: 'FileText',
      task: 'CheckSquare',
    };
    const iconName = icons[type] || 'Circle';
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return Icon;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      call: 'bg-blue-100 text-blue-600',
      meeting: 'bg-purple-100 text-purple-600',
      email: 'bg-green-100 text-green-600',
      follow_up: 'bg-amber-100 text-amber-600',
      internal_discussion: 'bg-gray-100 text-gray-600',
      qbr: 'bg-indigo-100 text-indigo-600',
      escalation: 'bg-red-100 text-red-600',
      note: 'bg-cyan-100 text-cyan-600',
      task: 'bg-orange-100 text-orange-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {recentActivities.map((activity, index) => {
          const Icon = getIconComponent(activity.activity_type);
          const isLast = index === recentActivities.length - 1;
          
          return (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className={cn('p-2 rounded-lg', getActivityColor(activity.activity_type))}>
                  <Icon className="h-4 w-4" />
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
              </div>
              
              {/* Content */}
              <div className={cn('flex-1 pb-4', !isLast && 'border-b border-gray-100')}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {getAccountName(activity.account_id)}
                    </p>
                    {activity.summary && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {activity.summary}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {getRelativeTime(activity.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">
                    {getActivityTypeLabel(activity.activity_type)}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">
                    {getUserName(activity.owner_id)}
                  </span>
                  {activity.is_completed && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-emerald-600 font-medium">Completed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
