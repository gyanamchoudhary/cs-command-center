import { aiInsights, accounts } from '@/data/sampleData';
import { cn } from '@/lib/utils';
import { Lightbulb, TrendingDown, TrendingUp, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export function AIInsights() {
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  
  const visibleInsights = aiInsights
    .filter(i => !i.is_acknowledged && !dismissedInsights.includes(i.id))
    .slice(0, 3);

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'churn_risk':
      case 'health_risk':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'expansion_opportunity':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'engagement_drop':
        return <TrendingDown className="h-5 w-5 text-amber-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'churn_risk':
      case 'health_risk':
        return 'bg-red-50 border-red-200';
      case 'expansion_opportunity':
        return 'bg-emerald-50 border-emerald-200';
      case 'engagement_drop':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const dismissInsight = (id: string) => {
    setDismissedInsights([...dismissedInsights, id]);
  };

  if (visibleInsights.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleInsights.map((insight) => (
          <div
            key={insight.id}
            className={cn(
              'p-4 rounded-xl border relative',
              getInsightColor(insight.insight_type)
            )}
          >
            <button
              onClick={() => dismissInsight(insight.id)}
              className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
            
            <div className="flex items-start gap-3">
              {getInsightIcon(insight.insight_type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{insight.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {getAccountName(insight.account_id)}
                </p>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {insight.description}
                </p>
                
                {insight.recommended_action && (
                  <div className="mt-3 p-2 bg-white/60 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-medium">Recommended Action</p>
                    <p className="text-sm text-gray-700 mt-0.5">
                      {insight.recommended_action}
                    </p>
                  </div>
                )}
                
                {insight.confidence_score && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${insight.confidence_score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {(insight.confidence_score * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
