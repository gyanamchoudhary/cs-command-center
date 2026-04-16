// Reports view - Analytics and reporting dashboard
import { useAuth } from '@/hooks/useAuth';
import { accounts, users, activities } from '@/data/sampleData';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  FileText,
  UserCheck
} from 'lucide-react';

// Colors for charts
const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  gray: '#6b7280',
  indigo: '#6366f1',
};

export function Reports() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Filter accounts based on user permissions
  const userAccounts = isAdmin 
    ? accounts.filter(a => !a.is_deleted)
    : accounts.filter(a => 
        !a.is_deleted && 
        (a.primary_csm_id === user?.id || a.secondary_csm_id === user?.id)
      );
  
  // Filter activities based on user permissions
  const userActivities = isAdmin
    ? activities
    : activities.filter(a => a.owner_id === user?.id);
  
  // Calculate user-specific metrics
  const totalARR = userAccounts.reduce((sum, a) => sum + a.arr, 0);
  const totalMRR = userAccounts.reduce((sum, a) => sum + a.mrr, 0);
  const activeAccounts = userAccounts.filter(a => a.status === 'active').length;
  const avgHealthScore = userAccounts.length > 0 
    ? userAccounts.reduce((sum, a) => sum + (a.health_score || 0), 0) / userAccounts.length 
    : 0;
  
  // Health distribution
  const healthDistribution = {
    green: userAccounts.filter(a => a.health_status === 'green').length,
    yellow: userAccounts.filter(a => a.health_status === 'yellow').length,
    red: userAccounts.filter(a => a.health_status === 'red').length,
  };
  
  // Status distribution
  const statusDistribution = {
    active: userAccounts.filter(a => a.status === 'active').length,
    churned: userAccounts.filter(a => a.status === 'churned').length,
    paused: userAccounts.filter(a => a.status === 'paused').length,
    prospect: userAccounts.filter(a => a.status === 'prospect').length,
  };
  
  // Segment distribution
  const segmentData = [
    { name: 'Enterprise', value: userAccounts.filter(a => a.segment === 'enterprise').length, color: COLORS.blue },
    { name: 'Mid Market', value: userAccounts.filter(a => a.segment === 'mid_market').length, color: COLORS.green },
    { name: 'SMB', value: userAccounts.filter(a => a.segment === 'smb').length, color: COLORS.amber },
  ].filter(d => d.value > 0);
  
  // Region distribution
  const regionData = [
    { name: 'North America', value: userAccounts.filter(a => a.region === 'North America').length, color: COLORS.blue },
    { name: 'EMEA', value: userAccounts.filter(a => a.region === 'EMEA').length, color: COLORS.green },
    { name: 'APAC', value: userAccounts.filter(a => a.region === 'APAC').length, color: COLORS.amber },
    { name: 'LATAM', value: userAccounts.filter(a => a.region === 'LATAM').length, color: COLORS.purple },
  ].filter(d => d.value > 0);
  
  // Activity type distribution
  const activityTypeData = [
    { name: 'Call', value: userActivities.filter(a => a.activity_type === 'call').length, color: COLORS.blue },
    { name: 'Meeting', value: userActivities.filter(a => a.activity_type === 'meeting').length, color: COLORS.green },
    { name: 'Email', value: userActivities.filter(a => a.activity_type === 'email').length, color: COLORS.amber },
    { name: 'Task', value: userActivities.filter(a => a.activity_type === 'task').length, color: COLORS.purple },
    { name: 'Other', value: userActivities.filter(a => !['call', 'meeting', 'email', 'task'].includes(a.activity_type)).length, color: COLORS.gray },
  ].filter(d => d.value > 0);
  
  // Monthly activity data (mock for visualization)
  const monthlyActivityData = [
    { month: 'Jan', activities: Math.floor(userActivities.length * 0.08) },
    { month: 'Feb', activities: Math.floor(userActivities.length * 0.09) },
    { month: 'Mar', activities: Math.floor(userActivities.length * 0.1) },
    { month: 'Apr', activities: Math.floor(userActivities.length * 0.08) },
    { month: 'May', activities: Math.floor(userActivities.length * 0.11) },
    { month: 'Jun', activities: Math.floor(userActivities.length * 0.1) },
  ];
  
  // Churn risk distribution
  const churnRiskData = [
    { name: 'Low', value: userAccounts.filter(a => a.churn_risk === 'low').length, color: COLORS.green },
    { name: 'Medium', value: userAccounts.filter(a => a.churn_risk === 'medium').length, color: COLORS.amber },
    { name: 'High', value: userAccounts.filter(a => a.churn_risk === 'high').length, color: COLORS.red },
    { name: 'Critical', value: userAccounts.filter(a => a.churn_risk === 'critical').length, color: '#7f1d1d' },
  ].filter(d => d.value > 0);

  const exportReport = (format: 'pdf' | 'excel') => {
    alert(`Exporting ${isAdmin ? 'company' : 'personal'} report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="h-full flex flex-col">
      <Header
        title={isAdmin ? 'Reports & Analytics' : 'My Reports'}
        subtitle={isAdmin 
          ? 'Comprehensive insights into company-wide customer success metrics'
          : 'Personal insights into your assigned accounts and activities'
        }
        actions={[
          {
            label: 'Export PDF',
            icon: <FileText className="h-4 w-4" />,
            onClick: () => exportReport('pdf'),
            variant: 'outline',
          },
          {
            label: 'Export Excel',
            icon: <Download className="h-4 w-4" />,
            onClick: () => exportReport('excel'),
            variant: 'outline',
          },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Account Metrics</TabsTrigger>
            <TabsTrigger value="activities">Activity Analytics</TabsTrigger>
            <TabsTrigger value="performance">{isAdmin ? 'CSM Performance' : 'My Performance'}</TabsTrigger>
            <TabsTrigger value="health">Health & Risk</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {isAdmin ? 'Total ARR' : 'My Portfolio ARR'}
                      </p>
                      <p className="text-2xl font-bold">{formatCurrency(totalARR, { compact: true })}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-600">{userAccounts.length} accounts</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Accounts</p>
                      <p className="text-2xl font-bold">{activeAccounts}</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Users className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-sm text-gray-400">
                      {Math.round((activeAccounts / (userAccounts.length || 1)) * 100)}% of total
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avg Health Score</p>
                      <p className="text-2xl font-bold">{avgHealthScore.toFixed(1)}</p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Activity className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className={cn(
                      'text-sm',
                      avgHealthScore >= 70 ? 'text-emerald-600' : 
                      avgHealthScore >= 40 ? 'text-amber-600' : 'text-red-600'
                    )}>
                      {avgHealthScore >= 70 ? 'Good' : avgHealthScore >= 40 ? 'Fair' : 'Needs Attention'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Activities</p>
                      <p className="text-2xl font-bold">{userActivities.length}</p>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <UserCheck className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-sm text-gray-400">
                      {userActivities.filter(a => a.is_completed).length} completed
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isAdmin ? 'Account Status Distribution' : 'My Account Status'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Active', value: statusDistribution.active, color: COLORS.green },
                            { name: 'Churned', value: statusDistribution.churned, color: COLORS.red },
                            { name: 'Paused', value: statusDistribution.paused, color: COLORS.amber },
                            { name: 'Prospect', value: statusDistribution.prospect, color: COLORS.blue },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Active', value: statusDistribution.active, color: COLORS.green },
                            { name: 'Churned', value: statusDistribution.churned, color: COLORS.red },
                            { name: 'Paused', value: statusDistribution.paused, color: COLORS.amber },
                            { name: 'Prospect', value: statusDistribution.prospect, color: COLORS.blue },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isAdmin ? 'Segment Distribution' : 'My Account Segments'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {segmentData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={segmentData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {segmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Metrics Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Accounts by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {regionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="value" name="Accounts" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ARR by Segment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Enterprise', value: userAccounts.filter(a => a.segment === 'enterprise').reduce((s, a) => s + a.arr, 0) / 1000000 },
                        { name: 'Mid Market', value: userAccounts.filter(a => a.segment === 'mid_market').reduce((s, a) => s + a.arr, 0) / 1000000 },
                        { name: 'SMB', value: userAccounts.filter(a => a.segment === 'smb').reduce((s, a) => s + a.arr, 0) / 1000000 },
                      ].filter(d => d.value > 0)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => `$${Number(value).toFixed(1)}M`} />
                        <Bar dataKey="value" name="ARR ($M)" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Total MRR</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalMRR, { compact: true })}</p>
                  <p className="text-sm text-gray-400 mt-1">Monthly recurring</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Avg ARR per Account</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(userAccounts.length > 0 ? totalARR / userAccounts.length : 0, { compact: true })}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Per account average</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Enterprise Accounts</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {userAccounts.filter(a => a.segment === 'enterprise').length}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Top tier accounts</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Analytics Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {activityTypeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activityTypeData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {activityTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No activities yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Activity Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="activities" name="Activities" stroke={COLORS.blue} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Total Activities</p>
                  <p className="text-2xl font-bold">{userActivities.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {userActivities.filter(a => a.is_completed).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {userActivities.filter(a => !a.is_completed).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {userActivities.filter(a => a.priority === 'urgent').length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab - My Performance for users, CSM Performance for admin */}
          <TabsContent value="performance" className="space-y-6">
            {isAdmin ? (
              // Admin view - All CSMs Performance
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">CSM Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={users.filter(u => u.role === 'user' && u.is_active).map(csm => {
                            const csmAccounts = accounts.filter(a => 
                              !a.is_deleted && 
                              (a.primary_csm_id === csm.id || a.secondary_csm_id === csm.id)
                            );
                            const totalArr = csmAccounts.reduce((sum, a) => sum + a.arr, 0);
                            const avgHealth = csmAccounts.length > 0 
                              ? csmAccounts.reduce((sum, a) => sum + (a.health_score || 0), 0) / csmAccounts.length 
                              : 0;
                            return {
                              name: `${csm.first_name} ${csm.last_name}`,
                              accounts: csmAccounts.length,
                              arr: totalArr / 1000000,
                              health: avgHealth,
                            };
                          })} 
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="arr" name="ARR ($M)" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
                          <Bar dataKey="accounts" name="Accounts" fill={COLORS.green} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  {users.filter(u => u.role === 'user' && u.is_active).map((csm) => {
                    const csmAccounts = accounts.filter(a => 
                      !a.is_deleted && 
                      (a.primary_csm_id === csm.id || a.secondary_csm_id === csm.id)
                    );
                    const csmARR = csmAccounts.reduce((sum, a) => sum + a.arr, 0);
                    const avgHealth = csmAccounts.length > 0 
                      ? csmAccounts.reduce((sum, a) => sum + (a.health_score || 0), 0) / csmAccounts.length 
                      : 0;
                    const csmActivities = activities.filter(a => a.owner_id === csm.id);
                    
                    return (
                      <Card key={csm.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <img src={csm.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                            <p className="font-medium text-gray-900">{csm.first_name} {csm.last_name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Accounts</p>
                              <p className="text-lg font-semibold">{csmAccounts.length}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">ARR</p>
                              <p className="text-lg font-semibold">{formatCurrency(csmARR, { compact: true })}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Avg Health</p>
                              <p className={cn(
                                'text-lg font-semibold',
                                avgHealth >= 70 ? 'text-emerald-600' : avgHealth >= 40 ? 'text-amber-600' : 'text-red-600'
                              )}>
                                {avgHealth.toFixed(0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Activities</p>
                              <p className="text-lg font-semibold">{csmActivities.length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              // User view - My Performance (only their own data)
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      My Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{userAccounts.length}</p>
                        <p className="text-sm text-gray-600 mt-1">Assigned Accounts</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalARR, { compact: true })}</p>
                        <p className="text-sm text-gray-600 mt-1">Total ARR</p>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <p className="text-3xl font-bold text-indigo-600">{avgHealthScore.toFixed(0)}</p>
                        <p className="text-sm text-gray-600 mt-1">Avg Health Score</p>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <p className="text-3xl font-bold text-amber-600">{userActivities.length}</p>
                        <p className="text-sm text-gray-600 mt-1">Total Activities</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">My Activity Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyActivityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="activities" name="Activities" stroke={COLORS.blue} strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">My Account Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Green (Good)', value: healthDistribution.green, color: COLORS.green },
                                { name: 'Yellow (At Risk)', value: healthDistribution.yellow, color: COLORS.amber },
                                { name: 'Red (Critical)', value: healthDistribution.red, color: COLORS.red },
                              ].filter(d => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                            >
                              {[
                                { name: 'Green (Good)', value: healthDistribution.green, color: COLORS.green },
                                { name: 'Yellow (At Risk)', value: healthDistribution.yellow, color: COLORS.amber },
                                { name: 'Red (Critical)', value: healthDistribution.red, color: COLORS.red },
                              ].filter(d => d.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">My Recent Activity Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {activityTypeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={activityTypeData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="value" name="Count" fill={COLORS.blue} radius={[4, 4, 0, 0]}>
                              {activityTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No activities yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Health & Risk Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Green (Good)', value: healthDistribution.green, color: COLORS.green },
                            { name: 'Yellow (At Risk)', value: healthDistribution.yellow, color: COLORS.amber },
                            { name: 'Red (Critical)', value: healthDistribution.red, color: COLORS.red },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Green (Good)', value: healthDistribution.green, color: COLORS.green },
                            { name: 'Yellow (At Risk)', value: healthDistribution.yellow, color: COLORS.amber },
                            { name: 'Red (Critical)', value: healthDistribution.red, color: COLORS.red },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Churn Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {churnRiskData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={churnRiskData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {churnRiskData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No risk data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Healthy Accounts</p>
                  <p className="text-2xl font-bold text-emerald-600">{healthDistribution.green}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {Math.round((healthDistribution.green / (userAccounts.length || 1)) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">At Risk</p>
                  <p className="text-2xl font-bold text-amber-600">{healthDistribution.yellow}</p>
                  <p className="text-sm text-gray-400 mt-1">Needs attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{healthDistribution.red}</p>
                  <p className="text-sm text-gray-400 mt-1">Immediate action</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">High/Critical Risk</p>
                  <p className="text-2xl font-bold text-red-700">
                    {userAccounts.filter(a => a.churn_risk === 'high' || a.churn_risk === 'critical').length}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Churn risk</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
