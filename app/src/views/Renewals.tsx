import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { accounts, users, renewals as allRenewals } from '@/data/sampleData';
import { setCurrentUser } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { HealthScoreBadge } from '@/components/shared/HealthScoreBadge';
import { formatCurrency, formatDate, getDaysUntil, getRenewalStageLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  Plus, Calendar, TrendingUp, AlertTriangle, CheckCircle, 
  MoreVertical, Edit, Trash2, X, FilePlus
} from 'lucide-react';
import type { Renewal, RenewalStage, ChurnRisk } from '@/types';

// Colors for stages
const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    planning: 'bg-blue-100 text-blue-700 border-blue-200',
    negotiation: 'bg-purple-100 text-purple-700 border-purple-200',
    closing: 'bg-amber-100 text-amber-700 border-amber-200',
    closed_won: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    closed_lost: 'bg-gray-100 text-gray-700 border-gray-200',
    at_risk: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[stage] || 'bg-gray-100 text-gray-700';
};

const getRiskColor = (risk?: string) => {
  const colors: Record<string, string> = {
    low: 'text-emerald-600',
    medium: 'text-amber-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  };
  return colors[risk || 'low'] || 'text-gray-600';
};

const stages: RenewalStage[] = ['planning', 'negotiation', 'closing', 'closed_won', 'closed_lost', 'at_risk'];

export function Renewals() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Set current user for API
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);
  
  // Data state
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  
  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Form states
  const [renewalForm, setRenewalForm] = useState({
    account_id: '',
    current_arr: '',
    projected_arr: '',
    renewal_date: '',
    stage: 'planning' as RenewalStage,
    probability: '50',
    risk_level: 'low' as ChurnRisk,
    notes: '',
    decision_maker_engaged: false,
    economic_buyer_identified: false,
    champion_identified: false,
  });
  
  // Load renewals with permission filtering
  useEffect(() => {
    setLoading(true);
    
    // Filter renewals based on user permissions
    let filteredRenewals = allRenewals;
    
    if (!isAdmin && user) {
      // Get user's assigned accounts
      const userAccountIds = accounts
        .filter(a => !a.is_deleted && (a.primary_csm_id === user.id || a.secondary_csm_id === user.id))
        .map(a => a.id);
      
      // Filter renewals for user's accounts
      filteredRenewals = allRenewals.filter(r => userAccountIds.includes(r.account_id));
    }
    
    setRenewals(filteredRenewals);
    setLoading(false);
  }, [isAdmin, user]);
  
  // Apply search and stage filters
  const filteredRenewals = renewals.filter(renewal => {
    const account = accounts.find(a => a.id === renewal.account_id);
    const matchesSearch = account?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesStage = stageFilter === 'all' || renewal.stage === stageFilter;
    const matchesRisk = riskFilter === 'all' || renewal.risk_level === riskFilter;
    return matchesSearch && matchesStage && matchesRisk;
  });
  
  // Sort by renewal date (upcoming first)
  const sortedRenewals = [...filteredRenewals].sort((a, b) => 
    new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
  );
  
  // Calculate pipeline metrics
  const pipelineMetrics = {
    totalPipeline: renewals
      .filter(r => r.stage !== 'closed_won' && r.stage !== 'closed_lost')
      .reduce((sum, r) => sum + (r.projected_arr || r.current_arr), 0),
    totalClosedWon: renewals
      .filter(r => r.stage === 'closed_won')
      .reduce((sum, r) => sum + (r.projected_arr || r.current_arr), 0),
    totalClosedLost: renewals
      .filter(r => r.stage === 'closed_lost')
      .reduce((sum, r) => sum + r.current_arr, 0),
    atRiskCount: renewals.filter(r => r.stage === 'at_risk').length,
    upcoming30Days: renewals.filter(r => {
      const days = getDaysUntil(r.renewal_date);
      return days <= 30 && days > 0 && r.stage !== 'closed_won' && r.stage !== 'closed_lost';
    }).length,
  };
  
  // Handle add renewal
  const handleAddClick = () => {
    setRenewalForm({
      account_id: '',
      current_arr: '',
      projected_arr: '',
      renewal_date: '',
      stage: 'planning',
      probability: '50',
      risk_level: 'low',
      notes: '',
      decision_maker_engaged: false,
      economic_buyer_identified: false,
      champion_identified: false,
    });
    setAddModalOpen(true);
  };
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRenewal: Renewal = {
      id: `ren-${Date.now()}`,
      account_id: renewalForm.account_id,
      current_arr: parseInt(renewalForm.current_arr) || 0,
      projected_arr: renewalForm.projected_arr ? parseInt(renewalForm.projected_arr) : undefined,
      renewal_date: renewalForm.renewal_date,
      stage: renewalForm.stage,
      probability: parseInt(renewalForm.probability) || 50,
      risk_level: renewalForm.risk_level,
      notes: renewalForm.notes || undefined,
      decision_maker_engaged: renewalForm.decision_maker_engaged,
      economic_buyer_identified: renewalForm.economic_buyer_identified,
      champion_identified: renewalForm.champion_identified,
      assigned_csm_id: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    allRenewals.push(newRenewal);
    setRenewals(prev => [...prev, newRenewal]);
    setAddModalOpen(false);
    toast.success('Renewal added successfully');
  };
  
  // Handle edit renewal
  const handleEditClick = (renewal: Renewal) => {
    setSelectedRenewal(renewal);
    setRenewalForm({
      account_id: renewal.account_id,
      current_arr: renewal.current_arr.toString(),
      projected_arr: renewal.projected_arr?.toString() || '',
      renewal_date: renewal.renewal_date,
      stage: renewal.stage,
      probability: renewal.probability?.toString() || '50',
      risk_level: renewal.risk_level || 'low',
      notes: renewal.notes || '',
      decision_maker_engaged: renewal.decision_maker_engaged || false,
      economic_buyer_identified: renewal.economic_buyer_identified || false,
      champion_identified: renewal.champion_identified || false,
    });
    setEditModalOpen(true);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRenewal) return;
    
    const updatedRenewal: Renewal = {
      ...selectedRenewal,
      account_id: renewalForm.account_id,
      current_arr: parseInt(renewalForm.current_arr) || 0,
      projected_arr: renewalForm.projected_arr ? parseInt(renewalForm.projected_arr) : undefined,
      renewal_date: renewalForm.renewal_date,
      stage: renewalForm.stage,
      probability: parseInt(renewalForm.probability) || 50,
      risk_level: renewalForm.risk_level,
      notes: renewalForm.notes || undefined,
      decision_maker_engaged: renewalForm.decision_maker_engaged,
      economic_buyer_identified: renewalForm.economic_buyer_identified,
      champion_identified: renewalForm.champion_identified,
      updated_at: new Date().toISOString(),
    };
    
    // Update in allRenewals
    const index = allRenewals.findIndex(r => r.id === selectedRenewal.id);
    if (index !== -1) {
      allRenewals[index] = updatedRenewal;
    }
    
    setRenewals(prev => prev.map(r => r.id === selectedRenewal.id ? updatedRenewal : r));
    setEditModalOpen(false);
    setSelectedRenewal(null);
    toast.success('Renewal updated successfully');
  };
  
  // Handle delete renewal
  const handleDeleteClick = (renewal: Renewal) => {
    setSelectedRenewal(renewal);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (!selectedRenewal) return;
    
    const index = allRenewals.findIndex(r => r.id === selectedRenewal.id);
    if (index !== -1) {
      allRenewals.splice(index, 1);
    }
    
    setRenewals(prev => prev.filter(r => r.id !== selectedRenewal.id));
    setDeleteModalOpen(false);
    setSelectedRenewal(null);
    toast.success('Renewal deleted successfully');
  };
  
  // Handle stage change (quick action)
  const handleStageChange = (renewal: Renewal, newStage: RenewalStage) => {
    const updatedRenewal = { ...renewal, stage: newStage, updated_at: new Date().toISOString() };
    
    const index = allRenewals.findIndex(r => r.id === renewal.id);
    if (index !== -1) {
      allRenewals[index] = updatedRenewal;
    }
    
    setRenewals(prev => prev.map(r => r.id === renewal.id ? updatedRenewal : r));
    toast.success(`Renewal marked as ${getRenewalStageLabel(newStage)}`);
  };
  
  // Get available accounts for dropdown
  const availableAccounts = isAdmin 
    ? accounts.filter(a => !a.is_deleted)
    : accounts.filter(a => !a.is_deleted && (a.primary_csm_id === user?.id || a.secondary_csm_id === user?.id));
  
  if (loading) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <Header
        title={isAdmin ? 'Renewal Management' : 'My Renewals'}
        subtitle={isAdmin 
          ? 'Track and manage all customer renewals'
          : 'Track and manage renewals for your assigned accounts'
        }
        searchPlaceholder="Search renewals..."
        onSearch={setSearchQuery}
        actions={[
          {
            label: 'Add Renewal',
            icon: <Plus className="h-4 w-4" />,
            onClick: handleAddClick,
            variant: 'default',
          },
        ]}
        filters={[
          {
            label: 'Stage',
            value: stageFilter,
            options: [
              { value: 'all', label: 'All Stages' },
              { value: 'planning', label: 'Planning' },
              { value: 'negotiation', label: 'Negotiation' },
              { value: 'closing', label: 'Closing' },
              { value: 'at_risk', label: 'At Risk' },
              { value: 'closed_won', label: 'Closed Won' },
              { value: 'closed_lost', label: 'Closed Lost' },
            ],
            onChange: setStageFilter,
          },
          {
            label: 'Risk',
            value: riskFilter,
            options: [
              { value: 'all', label: 'All Risk Levels' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ],
            onChange: setRiskFilter,
          },
        ]}
      />

      {/* Pipeline Summary */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">
            {isAdmin ? 'Pipeline Overview' : 'My Pipeline'}
          </span>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Total Pipeline</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(pipelineMetrics.totalPipeline, { compact: true })}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Closed Won</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(pipelineMetrics.totalClosedWon, { compact: true })}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Closed Lost</p>
            <p className="text-xl font-bold text-gray-600">{formatCurrency(pipelineMetrics.totalClosedLost, { compact: true })}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">At Risk</p>
            <p className="text-xl font-bold text-red-600">{pipelineMetrics.atRiskCount}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Due in 30 Days</p>
            <p className="text-xl font-bold text-amber-600">{pipelineMetrics.upcoming30Days}</p>
          </div>
        </div>
        
        {/* Stage Breakdown */}
        <div className="grid grid-cols-6 gap-3">
          {stages.map(stage => {
            const stageRenewals = renewals.filter(r => r.stage === stage);
            const count = stageRenewals.length;
            const totalArr = stageRenewals.reduce((sum, r) => sum + (r.projected_arr || r.current_arr), 0);
            return (
              <div
                key={stage}
                className={cn(
                  'p-3 rounded-lg border-2 text-center cursor-pointer transition-colors',
                  stageFilter === stage ? 'ring-2 ring-blue-500 ring-offset-2' : '',
                  getStageColor(stage)
                )}
                onClick={() => setStageFilter(stageFilter === stage ? 'all' : stage)}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium uppercase mt-1">{getRenewalStageLabel(stage)}</p>
                <p className="text-sm mt-1">{formatCurrency(totalArr, { compact: true })}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedRenewals.map((renewal) => {
            const account = accounts.find(a => a.id === renewal.account_id);
            const assignedCsm = users.find(u => u.id === renewal.assigned_csm_id);
            const daysUntil = getDaysUntil(renewal.renewal_date);
            const isUrgent = daysUntil <= 30 && renewal.stage !== 'closed_won' && renewal.stage !== 'closed_lost';
            const isOverdue = daysUntil < 0 && renewal.stage !== 'closed_won' && renewal.stage !== 'closed_lost';
            
            return (
              <div
                key={renewal.id}
                className={cn(
                  'bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow',
                  isUrgent && 'border-amber-300 ring-1 ring-amber-100',
                  isOverdue && 'border-red-300 ring-1 ring-red-100'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold border',
                    getStageColor(renewal.stage)
                  )}>
                    {getRenewalStageLabel(renewal.stage)}
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">Overdue</Badge>
                    )}
                    {isUrgent && !isOverdue && (
                      <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">Urgent</Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedRenewal(renewal); setDetailModalOpen(true); }}>
                          <FilePlus className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(renewal)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {renewal.stage !== 'closed_won' && renewal.stage !== 'closed_lost' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStageChange(renewal, 'closed_won')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                              Mark Won
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStageChange(renewal, 'closed_lost')}>
                              <X className="h-4 w-4 mr-2 text-red-600" />
                              Mark Lost
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(renewal)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Account Name */}
                <h3 
                  className="font-semibold text-gray-900 mt-3 cursor-pointer hover:text-blue-600"
                  onClick={() => { setSelectedRenewal(renewal); setDetailModalOpen(true); }}
                >
                  {account?.name}
                </h3>
                
                {assignedCsm && (
                  <p className="text-xs text-gray-500 mt-1">
                    Assigned to: {assignedCsm.first_name} {assignedCsm.last_name}
                  </p>
                )}

                {/* Financial Details */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Current ARR</p>
                    <p className="font-medium">{formatCurrency(renewal.current_arr, { compact: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Projected ARR</p>
                    <p className="font-medium">
                      {renewal.projected_arr ? formatCurrency(renewal.projected_arr, { compact: true }) : '-'}
                    </p>
                  </div>
                </div>
                
                {/* Growth Indicator */}
                {renewal.projected_arr && (
                  <div className="mt-2">
                    <p className={cn(
                      'text-sm font-medium',
                      renewal.projected_arr > renewal.current_arr ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {renewal.projected_arr > renewal.current_arr ? '+' : ''}
                      {((renewal.projected_arr - renewal.current_arr) / renewal.current_arr * 100).toFixed(1)}% 
                      {renewal.projected_arr > renewal.current_arr ? 'expansion' : 'contraction'}
                    </p>
                  </div>
                )}

                {/* Probability */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Probability</span>
                    <span className="font-medium">{renewal.probability}%</span>
                  </div>
                  <Progress value={renewal.probability} className="h-2" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className={cn(
                      'text-sm',
                      isOverdue ? 'text-red-600 font-medium' : 
                      isUrgent ? 'text-amber-600 font-medium' : 'text-gray-600'
                    )}>
                      {isOverdue ? `${Math.abs(daysUntil)} days overdue` : 
                       daysUntil > 0 ? `${daysUntil} days left` : 'Today'}
                    </span>
                  </div>
                  {renewal.risk_level && renewal.risk_level !== 'low' && (
                    <span className={cn('text-sm font-medium capitalize', getRiskColor(renewal.risk_level))}>
                      {renewal.risk_level} risk
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sortedRenewals.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4 text-lg">No renewals found</p>
            <p className="text-gray-400 mt-1">
              {isAdmin 
                ? 'Try adjusting your filters or add a new renewal'
                : 'No renewals for your assigned accounts'}
            </p>
          </div>
        )}
      </div>

      {/* Add Renewal Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Renewal
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Account *</Label>
              <Select 
                value={renewalForm.account_id} 
                onValueChange={(value) => setRenewalForm({...renewalForm, account_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current ARR ($) *</Label>
                <Input
                  type="number"
                  value={renewalForm.current_arr}
                  onChange={(e) => setRenewalForm({...renewalForm, current_arr: e.target.value})}
                  placeholder="e.g. 500000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Projected ARR ($)</Label>
                <Input
                  type="number"
                  value={renewalForm.projected_arr}
                  onChange={(e) => setRenewalForm({...renewalForm, projected_arr: e.target.value})}
                  placeholder="e.g. 600000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Renewal Date *</Label>
                <Input
                  type="date"
                  value={renewalForm.renewal_date}
                  onChange={(e) => setRenewalForm({...renewalForm, renewal_date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Stage *</Label>
                <Select 
                  value={renewalForm.stage} 
                  onValueChange={(value) => setRenewalForm({...renewalForm, stage: value as RenewalStage})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closing">Closing</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={renewalForm.probability}
                  onChange={(e) => setRenewalForm({...renewalForm, probability: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select 
                  value={renewalForm.risk_level} 
                  onValueChange={(value) => setRenewalForm({...renewalForm, risk_level: value as ChurnRisk})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={renewalForm.notes}
                onChange={(e) => setRenewalForm({...renewalForm, notes: e.target.value})}
                placeholder="Add any notes about this renewal..."
              />
            </div>
            
            <div className="space-y-3">
              <Label>Stakeholder Engagement</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={renewalForm.decision_maker_engaged}
                    onCheckedChange={(checked) => setRenewalForm({...renewalForm, decision_maker_engaged: checked as boolean})}
                  />
                  <Label className="mb-0 text-sm">Decision Maker Engaged</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={renewalForm.economic_buyer_identified}
                    onCheckedChange={(checked) => setRenewalForm({...renewalForm, economic_buyer_identified: checked as boolean})}
                  />
                  <Label className="mb-0 text-sm">Economic Buyer Identified</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={renewalForm.champion_identified}
                    onCheckedChange={(checked) => setRenewalForm({...renewalForm, champion_identified: checked as boolean})}
                  />
                  <Label className="mb-0 text-sm">Champion Identified</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Renewal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Renewal Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Renewal
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Account *</Label>
              <Select 
                value={renewalForm.account_id} 
                onValueChange={(value) => setRenewalForm({...renewalForm, account_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current ARR ($) *</Label>
                <Input
                  type="number"
                  value={renewalForm.current_arr}
                  onChange={(e) => setRenewalForm({...renewalForm, current_arr: e.target.value})}
                  placeholder="e.g. 500000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Projected ARR ($)</Label>
                <Input
                  type="number"
                  value={renewalForm.projected_arr}
                  onChange={(e) => setRenewalForm({...renewalForm, projected_arr: e.target.value})}
                  placeholder="e.g. 600000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Renewal Date *</Label>
                <Input
                  type="date"
                  value={renewalForm.renewal_date}
                  onChange={(e) => setRenewalForm({...renewalForm, renewal_date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Stage *</Label>
                <Select 
                  value={renewalForm.stage} 
                  onValueChange={(value) => setRenewalForm({...renewalForm, stage: value as RenewalStage})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closing">Closing</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={renewalForm.probability}
                  onChange={(e) => setRenewalForm({...renewalForm, probability: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select 
                  value={renewalForm.risk_level} 
                  onValueChange={(value) => setRenewalForm({...renewalForm, risk_level: value as ChurnRisk})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={renewalForm.notes}
                onChange={(e) => setRenewalForm({...renewalForm, notes: e.target.value})}
                placeholder="Add any notes about this renewal..."
              />
            </div>
            
            <div className="space-y-3">
              <Label>Stakeholder Engagement</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={renewalForm.decision_maker_engaged}
                    onCheckedChange={(checked) => setRenewalForm({...renewalForm, decision_maker_engaged: checked as boolean})}
                  />
                  <Label className="mb-0 text-sm">Decision Maker Engaged</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={renewalForm.economic_buyer_identified}
                    onCheckedChange={(checked) => setRenewalForm({...renewalForm, economic_buyer_identified: checked as boolean})}
                  />
                  <Label className="mb-0 text-sm">Economic Buyer Identified</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={renewalForm.champion_identified}
                    onCheckedChange={(checked) => setRenewalForm({...renewalForm, champion_identified: checked as boolean})}
                  />
                  <Label className="mb-0 text-sm">Champion Identified</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Update Renewal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Renewal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this renewal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRenewal && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">
                {accounts.find(a => a.id === selectedRenewal.account_id)?.name}
              </p>
              <p className="text-sm text-gray-500">
                Current ARR: {formatCurrency(selectedRenewal.current_arr)}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Renewal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renewal Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedRenewal && (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className={cn(
                      'inline-flex px-3 py-1 rounded-full text-xs font-semibold border',
                      getStageColor(selectedRenewal.stage)
                    )}>
                      {getRenewalStageLabel(selectedRenewal.stage)}
                    </div>
                    <DialogHeader className="mt-2">
                      <DialogTitle className="text-xl">
                        {accounts.find(a => a.id === selectedRenewal.account_id)?.name}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedRenewal.assigned_csm_id && (
                      <p className="text-sm text-gray-500 mt-1">
                        Assigned to: {users.find(u => u.id === selectedRenewal.assigned_csm_id)?.first_name} {users.find(u => u.id === selectedRenewal.assigned_csm_id)?.last_name}
                      </p>
                    )}
                  </div>
                  {accounts.find(a => a.id === selectedRenewal.account_id)?.health_score && (
                    <HealthScoreBadge score={accounts.find(a => a.id === selectedRenewal.account_id)!.health_score!} />
                  )}
                </div>
              </div>

              <div className="p-6 overflow-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Financial Details</h4>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current ARR</span>
                        <span className="font-medium">{formatCurrency(selectedRenewal.current_arr)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Projected ARR</span>
                        <span className="font-medium">
                          {selectedRenewal.projected_arr ? formatCurrency(selectedRenewal.projected_arr) : '-'}
                        </span>
                      </div>
                      {selectedRenewal.projected_arr && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Growth</span>
                          <span className={cn(
                            'font-medium',
                            selectedRenewal.projected_arr > selectedRenewal.current_arr 
                              ? 'text-emerald-600' 
                              : 'text-red-600'
                          )}>
                            {((selectedRenewal.projected_arr - selectedRenewal.current_arr) / selectedRenewal.current_arr * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Renewal Date</span>
                        <span className="font-medium">{formatDate(selectedRenewal.renewal_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Days Until</span>
                        <span className={cn(
                          'font-medium',
                          getDaysUntil(selectedRenewal.renewal_date) <= 30 ? 'text-red-600' : 'text-gray-900'
                        )}>
                          {getDaysUntil(selectedRenewal.renewal_date)} days
                        </span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mt-6 mb-3">Risk Assessment</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Risk Level</span>
                        <span className={cn('font-medium capitalize', getRiskColor(selectedRenewal.risk_level))}>
                          {selectedRenewal.risk_level || 'Low'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Probability</span>
                        <div className="mt-1">
                          <Progress value={selectedRenewal.probability} className="h-2" />
                          <span className="text-sm text-gray-600 mt-1">{selectedRenewal.probability}%</span>
                        </div>
                      </div>
                      {selectedRenewal.risk_reasons && selectedRenewal.risk_reasons.length > 0 && (
                        <div>
                          <span className="text-gray-500">Risk Factors</span>
                          <ul className="mt-1 space-y-1">
                            {selectedRenewal.risk_reasons.map((reason, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Stakeholder Engagement</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Decision Maker Engaged</span>
                        {selectedRenewal.decision_maker_engaged ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <span className="text-sm text-amber-600">Pending</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Economic Buyer Identified</span>
                        {selectedRenewal.economic_buyer_identified ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <span className="text-sm text-amber-600">Pending</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Champion Identified</span>
                        {selectedRenewal.champion_identified ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <span className="text-sm text-amber-600">Pending</span>
                        )}
                      </div>
                    </div>

                    {selectedRenewal.objections && selectedRenewal.objections.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Objections</h4>
                        <ul className="space-y-2">
                          {selectedRenewal.objections.map((objection, idx) => (
                            <li key={idx} className="p-3 bg-red-50 rounded-lg text-sm text-gray-700">
                              {objection}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRenewal.notes && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                        <p className="text-gray-600 text-sm">{selectedRenewal.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button onClick={() => { setDetailModalOpen(false); handleEditClick(selectedRenewal); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Renewal
                  </Button>
                  {selectedRenewal.stage !== 'closed_won' && selectedRenewal.stage !== 'closed_lost' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => { handleStageChange(selectedRenewal, 'closed_won'); setDetailModalOpen(false); }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Won
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { handleStageChange(selectedRenewal, 'closed_lost'); setDetailModalOpen(false); }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Mark Lost
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
