import { escalations, accounts } from '@/data/sampleData';
import { getRelativeTime, getSeverityColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, User } from 'lucide-react';

export function ActiveEscalations() {
  const activeEscalations = escalations
    .filter(e => e.status === 'open' || e.status === 'in_progress')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Escalations</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {activeEscalations.map((escalation) => {
          const colors = getSeverityColor(escalation.severity);
          const slaWarning = escalation.sla_deadline && 
            new Date(escalation.sla_deadline).getTime() - Date.now() < 4 * 60 * 60 * 1000;
          
          return (
            <div
              key={escalation.id}
              className={cn(
                'p-4 rounded-lg border-l-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer',
                colors.border.replace('border-', '')
              )}
              style={{ borderLeftColor: colors.dot.replace('bg-', '#').replace('500', '') }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full uppercase', colors.bg, colors.text)}>
                      {escalation.severity}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {escalation.escalation_type}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mt-2 truncate">
                    {escalation.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {getAccountName(escalation.account_id)}
                  </p>
                </div>
                
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {getRelativeTime(escalation.created_at)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                {escalation.sla_deadline && (
                  <div className={cn(
                    'flex items-center gap-1 text-xs',
                    slaWarning ? 'text-red-600 font-medium' : 'text-gray-500'
                  )}>
                    <Clock className="h-3.5 w-3.5" />
                    SLA: {getRelativeTime(escalation.sla_deadline)}
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="h-3.5 w-3.5" />
                  {escalation.assigned_to ? 'Assigned' : 'Unassigned'}
                </div>
              </div>
            </div>
          );
        })}
        
        {activeEscalations.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-2">No active escalations</p>
          </div>
        )}
      </div>
    </div>
  );
}
