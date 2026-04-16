import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardData, setCurrentUser, type DashboardData } from '@/lib/api';
import { accounts, users } from '@/data/sampleData';
import { 
  TrendingDown, AlertTriangle, 
  Activity as ActivityIcon, DollarSign, Building2, ArrowRight,
  BarChart3, PieChart, UserCheck, FilePlus, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatCurrency, getRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { HealthStatus } from '@/types';

// Health score color mapping
const getHealthColor = (status?: HealthStatus) => {
  switch (status) {
    case 'green': return 'text-emerald-600 bg-emerald-50';
    case 'yellow': return 'text-amber-600 bg-amber-50';
    case 'red': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  

  
  // Set current user for API
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getDashboardData();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        toast.error(response.error || 'Failed to load dashboard data');
      }
      setLoading(false);
    };
    
    fetchData();
  }, [user]);
  
  const metrics = dashboardData?.metrics;
  const recentAccounts = dashboardData?.accounts || [];
  const recentActivities = dashboardData?.recent_activities || [];
  const healthDistribution = dashboardData?.health_distribution || { green: 0, yellow: 0, red: 0 };
  
  // Calculate health score percentage
  const totalHealthAccounts = healthDistribution.green + healthDistribution.yellow + healthDistribution.red;
  const healthyPercentage = totalHealthAccounts > 0 
    ? Math.round((healthDistribution.green / totalHealthAccounts) * 100) 
    : 0;
  
  if (loading) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isAdmin 
                ? 'Overview of all accounts and team performance' 
                : `Welcome back, ${user?.first_name}! Here's your portfolio overview.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => {
                  // Dispatch custom event to navigate to Reports
                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'reports' }));
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <ActivityIcon className="h-4 w-4 mr-2" />
                  Quick Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: 'activities' }));
                  }}
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Log Activity
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: 'accounts' }));
                  }}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  View Accounts
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: 'activities' }));
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Activities
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('navigate', { detail: 'escalations' }));
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      View Escalations
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {isAdmin ? 'Total Accounts' : 'My Accounts'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {metrics?.total_accounts || 0}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    {metrics?.active_accounts || 0} active
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total ARR</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(metrics?.total_arr || 0, { compact: true })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(metrics?.total_mrr || 0, { compact: true })} MRR
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Health Score</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {healthyPercentage}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {healthDistribution.green} healthy accounts
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {metrics?.at_risk_accounts ? (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        At Risk
                      </span>
                    ) : (
                      'At Risk'
                    )}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {metrics?.at_risk_accounts || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {metrics?.upcoming_renewals_30d || 0} renewals in 30d
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* My Accounts */}
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {isAdmin ? 'All Accounts' : 'My Accounts'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => toast.info('View all accounts')}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentAccounts.length > 0 ? (
                <div className="space-y-3">
                  {recentAccounts.map((account) => (
                    <div 
                      key={account.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => toast.info(`View ${account.name}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          getHealthColor(account.health_status)
                        )}>
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{account.name}</p>
                          <p className="text-sm text-gray-500">
                            {account.industry || 'No industry'} • {account.region}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(account.arr, { compact: true })}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs',
                            account.status === 'active' && 'border-emerald-200 text-emerald-700',
                            account.status === 'churned' && 'border-red-200 text-red-700',
                            account.status === 'paused' && 'border-amber-200 text-amber-700'
                          )}
                        >
                          {account.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-3">
                    {isAdmin ? 'No accounts found' : 'No accounts assigned to you yet'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Health Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-emerald-600" />
                Health Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">Healthy</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {healthDistribution.green}
                    </span>
                  </div>
                  <Progress 
                    value={totalHealthAccounts > 0 ? (healthDistribution.green / totalHealthAccounts) * 100 : 0} 
                    className="h-2 bg-gray-100"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">At Risk</span>
                    <span className="text-sm font-medium text-amber-600">
                      {healthDistribution.yellow}
                    </span>
                  </div>
                  <Progress 
                    value={totalHealthAccounts > 0 ? (healthDistribution.yellow / totalHealthAccounts) * 100 : 0} 
                    className="h-2 bg-gray-100"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">Critical</span>
                    <span className="text-sm font-medium text-red-600">
                      {healthDistribution.red}
                    </span>
                  </div>
                  <Progress 
                    value={totalHealthAccounts > 0 ? (healthDistribution.red / totalHealthAccounts) * 100 : 0} 
                    className="h-2 bg-gray-100"
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Overall Health</span>
                  <Badge 
                    className={cn(
                      healthyPercentage >= 70 ? 'bg-emerald-100 text-emerald-700' :
                      healthyPercentage >= 40 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    )}
                  >
                    {healthyPercentage >= 70 ? 'Good' : healthyPercentage >= 40 ? 'Fair' : 'Poor'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => toast.info('View all activities')}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity) => {
                  const account = accounts.find(a => a.id === activity.account_id);
                  const activityUser = users.find(u => u.id === activity.owner_id);
                  
                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        activity.activity_type === 'call' && 'bg-blue-100 text-blue-600',
                        activity.activity_type === 'meeting' && 'bg-purple-100 text-purple-600',
                        activity.activity_type === 'email' && 'bg-green-100 text-green-600',
                        activity.activity_type === 'task' && 'bg-orange-100 text-orange-600',
                        activity.activity_type === 'escalation' && 'bg-red-100 text-red-600',
                        activity.activity_type === 'qbr' && 'bg-indigo-100 text-indigo-600'
                      )}>
                        <ActivityIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">
                          {account?.name} • {activityUser?.first_name} {activityUser?.last_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {getRelativeTime(activity.created_at)}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.activity_type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ActivityIcon className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-3">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Admin-only section */}
        {isAdmin && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Team Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {users.filter(u => u.role === 'user' && u.is_active).map((csm) => {
                  const csmAccounts = accounts.filter(a => 
                    !a.is_deleted && 
                    (a.primary_csm_id === csm.id || a.secondary_csm_id === csm.id)
                  );
                  const csmARR = csmAccounts.reduce((sum, a) => sum + a.arr, 0);
                  
                  return (
                    <div 
                      key={csm.id} 
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => toast.info(`View ${csm.first_name}'s dashboard`)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={csm.avatar_url} 
                          alt="" 
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {csm.first_name} {csm.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{csm.department}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Accounts</span>
                          <span className="font-medium">{csmAccounts.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">ARR</span>
                          <span className="font-medium">
                            {formatCurrency(csmARR, { compact: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
    </div>
  );
}
