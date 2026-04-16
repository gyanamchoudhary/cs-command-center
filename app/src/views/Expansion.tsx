import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { accounts, users, expansionOpportunities as allOpportunities } from '@/data/sampleData';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate, getOpportunityStageLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

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
  Plus, TrendingUp, MapPin, Zap, DollarSign, Calendar, User, 
  CheckCircle, MessageSquare, Target, MoreVertical, Edit, Trash2, 
  FilePlus, X
} from 'lucide-react';
import type { ExpansionOpportunity, OpportunityType, OpportunityStage } from '@/types';

// Colors for stages
const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    identified: 'bg-blue-100 text-blue-700 border-blue-200',
    qualified: 'bg-purple-100 text-purple-700 border-purple-200',
    proposal: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    negotiation: 'bg-amber-100 text-amber-700 border-amber-200',
    closed_won: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    closed_lost: 'bg-gray-100 text-gray-700 border-gray-200',
    on_hold: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return colors[stage] || 'bg-gray-100 text-gray-700';
};

const getOpportunityTypeIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    upsell: <TrendingUp className="h-5 w-5" />,
    cross_sell: <Zap className="h-5 w-5" />,
    renewal_expansion: <Calendar className="h-5 w-5" />,
    new_product: <Target className="h-5 w-5" />,
    new_region: <MapPin className="h-5 w-5" />,
  };
  return icons[type] || <TrendingUp className="h-5 w-5" />;
};

const stages: OpportunityStage[] = ['identified', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'on_hold'];

export function Expansion() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Data state
  const [opportunities, setOpportunities] = useState<ExpansionOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ExpansionOpportunity | null>(null);
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [valueModalOpen, setValueModalOpen] = useState(false);
  
  // Form states
  const [opportunityForm, setOpportunityForm] = useState({
    account_id: '',
    opportunity_name: '',
    opportunity_type: 'upsell' as OpportunityType,
    potential_arr: '',
    potential_mrr: '',
    expected_close_date: '',
    stage: 'identified' as OpportunityStage,
    probability: '50',
    trigger_type: '',
    notes: '',
    assigned_csm_id: '',
    assigned_ae_id: '',
  });
  
  const [noteText, setNoteText] = useState('');
  const [newValue, setNewValue] = useState('');
  
  // Load opportunities with permission filtering
  useEffect(() => {
    setLoading(true);
    
    // Filter opportunities based on user permissions
    let filteredOpportunities = allOpportunities;
    
    if (!isAdmin && user) {
      // Get user's assigned accounts
      const userAccountIds = accounts
        .filter(a => !a.is_deleted && (a.primary_csm_id === user.id || a.secondary_csm_id === user.id))
        .map(a => a.id);
      
      // Filter opportunities for user's accounts
      filteredOpportunities = allOpportunities.filter(o => userAccountIds.includes(o.account_id));
    }
    
    setOpportunities(filteredOpportunities);
    setLoading(false);
  }, [isAdmin, user]);
  
  // Apply search and filters
  const filteredOpportunities = opportunities.filter(opp => {
    const account = accounts.find(a => a.id === opp.account_id);
    const matchesSearch = 
      opp.opportunity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || opp.stage === stageFilter;
    const matchesType = typeFilter === 'all' || opp.opportunity_type === typeFilter;
    return matchesSearch && matchesStage && matchesType;
  });
  
  // Calculate pipeline metrics
  const pipelineMetrics = {
    totalPipeline: opportunities
      .filter(o => o.stage !== 'closed_won' && o.stage !== 'closed_lost')
      .reduce((sum, o) => sum + o.potential_arr, 0),
    weightedPipeline: opportunities
      .filter(o => o.stage !== 'closed_won' && o.stage !== 'closed_lost')
      .reduce((sum, o) => sum + (o.potential_arr * (o.probability || 0) / 100), 0),
    closedWon: opportunities
      .filter(o => o.stage === 'closed_won')
      .reduce((sum, o) => sum + o.potential_arr, 0),
    totalCount: opportunities.filter(o => o.stage !== 'closed_won' && o.stage !== 'closed_lost').length,
    wonCount: opportunities.filter(o => o.stage === 'closed_won').length,
  };
  
  // Handle add opportunity
  const handleAddClick = () => {
    setOpportunityForm({
      account_id: '',
      opportunity_name: '',
      opportunity_type: 'upsell',
      potential_arr: '',
      potential_mrr: '',
      expected_close_date: '',
      stage: 'identified',
      probability: '50',
      trigger_type: '',
      notes: '',
      assigned_csm_id: user?.id || '',
      assigned_ae_id: '',
    });
    setAddModalOpen(true);
  };
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOpportunity: ExpansionOpportunity = {
      id: `exp-${Date.now()}`,
      account_id: opportunityForm.account_id,
      opportunity_name: opportunityForm.opportunity_name,
      opportunity_type: opportunityForm.opportunity_type,
      potential_arr: parseInt(opportunityForm.potential_arr) || 0,
      potential_mrr: opportunityForm.potential_mrr ? parseInt(opportunityForm.potential_mrr) : undefined,
      expected_close_date: opportunityForm.expected_close_date || undefined,
      stage: opportunityForm.stage,
      probability: parseInt(opportunityForm.probability) || 50,
      trigger_type: opportunityForm.trigger_type || undefined,
      notes: opportunityForm.notes || undefined,
      assigned_csm_id: opportunityForm.assigned_csm_id || user?.id,
      assigned_ae_id: opportunityForm.assigned_ae_id || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    allOpportunities.push(newOpportunity);
    setOpportunities(prev => [...prev, newOpportunity]);
    setAddModalOpen(false);
    toast.success('Opportunity created successfully');
  };
  
  // Handle edit opportunity
  const handleEditClick = (opportunity: ExpansionOpportunity) => {
    setSelectedOpportunity(opportunity);
    setOpportunityForm({
      account_id: opportunity.account_id,
      opportunity_name: opportunity.opportunity_name,
      opportunity_type: opportunity.opportunity_type,
      potential_arr: opportunity.potential_arr.toString(),
      potential_mrr: opportunity.potential_mrr?.toString() || '',
      expected_close_date: opportunity.expected_close_date || '',
      stage: opportunity.stage,
      probability: opportunity.probability?.toString() || '50',
      trigger_type: opportunity.trigger_type || '',
      notes: opportunity.notes || '',
      assigned_csm_id: opportunity.assigned_csm_id || '',
      assigned_ae_id: opportunity.assigned_ae_id || '',
    });
    setEditModalOpen(true);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity) return;
    
    const updatedOpportunity: ExpansionOpportunity = {
      ...selectedOpportunity,
      account_id: opportunityForm.account_id,
      opportunity_name: opportunityForm.opportunity_name,
      opportunity_type: opportunityForm.opportunity_type,
      potential_arr: parseInt(opportunityForm.potential_arr) || 0,
      potential_mrr: opportunityForm.potential_mrr ? parseInt(opportunityForm.potential_mrr) : undefined,
      expected_close_date: opportunityForm.expected_close_date || undefined,
      stage: opportunityForm.stage,
      probability: parseInt(opportunityForm.probability) || 50,
      trigger_type: opportunityForm.trigger_type || undefined,
      notes: opportunityForm.notes || undefined,
      assigned_csm_id: opportunityForm.assigned_csm_id || undefined,
      assigned_ae_id: opportunityForm.assigned_ae_id || undefined,
      updated_at: new Date().toISOString(),
    };
    
    const index = allOpportunities.findIndex(o => o.id === selectedOpportunity.id);
    if (index !== -1) {
      allOpportunities[index] = updatedOpportunity;
    }
    
    setOpportunities(prev => prev.map(o => o.id === selectedOpportunity.id ? updatedOpportunity : o));
    setEditModalOpen(false);
    setSelectedOpportunity(null);
    toast.success('Opportunity updated successfully');
  };
  
  // Handle delete opportunity
  const handleDeleteClick = (opportunity: ExpansionOpportunity) => {
    setSelectedOpportunity(opportunity);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (!selectedOpportunity) return;
    
    const index = allOpportunities.findIndex(o => o.id === selectedOpportunity.id);
    if (index !== -1) {
      allOpportunities.splice(index, 1);
    }
    
    setOpportunities(prev => prev.filter(o => o.id !== selectedOpportunity.id));
    setDeleteModalOpen(false);
    setSelectedOpportunity(null);
    toast.success('Opportunity deleted successfully');
  };
  
  // Handle add note
  const handleAddNoteClick = (opportunity: ExpansionOpportunity) => {
    setSelectedOpportunity(opportunity);
    setNoteText(opportunity.notes || '');
    setNoteModalOpen(true);
  };
  
  const confirmAddNote = () => {
    if (!selectedOpportunity) return;
    
    const updatedOpportunity: ExpansionOpportunity = {
      ...selectedOpportunity,
      notes: noteText || undefined,
      updated_at: new Date().toISOString(),
    };
    
    const index = allOpportunities.findIndex(o => o.id === selectedOpportunity.id);
    if (index !== -1) {
      allOpportunities[index] = updatedOpportunity;
    }
    
    setOpportunities(prev => prev.map(o => o.id === selectedOpportunity.id ? updatedOpportunity : o));
    setNoteModalOpen(false);
    setSelectedOpportunity(null);
    setNoteText('');
    toast.success('Note added successfully');
  };
  
  // Handle update value
  const handleUpdateValueClick = (opportunity: ExpansionOpportunity) => {
    setSelectedOpportunity(opportunity);
    setNewValue(opportunity.potential_arr.toString());
    setValueModalOpen(true);
  };
  
  const confirmUpdateValue = () => {
    if (!selectedOpportunity) return;
    
    const updatedOpportunity: ExpansionOpportunity = {
      ...selectedOpportunity,
      potential_arr: parseInt(newValue) || 0,
      updated_at: new Date().toISOString(),
    };
    
    const index = allOpportunities.findIndex(o => o.id === selectedOpportunity.id);
    if (index !== -1) {
      allOpportunities[index] = updatedOpportunity;
    }
    
    setOpportunities(prev => prev.map(o => o.id === selectedOpportunity.id ? updatedOpportunity : o));
    setValueModalOpen(false);
    setSelectedOpportunity(null);
    setNewValue('');
    toast.success('Value updated successfully');
  };
  
  // Handle stage change (Mark Won/Lost)
  const handleStageChange = (opportunity: ExpansionOpportunity, newStage: OpportunityStage) => {
    const updatedOpportunity = { 
      ...opportunity, 
      stage: newStage, 
      updated_at: new Date().toISOString() 
    };
    
    const index = allOpportunities.findIndex(o => o.id === opportunity.id);
    if (index !== -1) {
      allOpportunities[index] = updatedOpportunity;
    }
    
    setOpportunities(prev => prev.map(o => o.id === opportunity.id ? updatedOpportunity : o));
    toast.success(`Opportunity marked as ${getOpportunityStageLabel(newStage)}`);
  };
  
  // Get available accounts for dropdown
  const availableAccounts = isAdmin 
    ? accounts.filter(a => !a.is_deleted)
    : accounts.filter(a => !a.is_deleted && (a.primary_csm_id === user?.id || a.secondary_csm_id === user?.id));
  
  // Get available users for assignment
  const availableUsers = users.filter(u => u.is_active);
  
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
        <div className="grid grid-cols-3 gap-6 mb-6">
          {[...Array(3)].map((_, i) => (
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
        title={isAdmin ? 'Expansion Tracker' : 'My Opportunities'}
        subtitle={isAdmin 
          ? 'Track upsell and cross-sell opportunities'
          : 'Track opportunities for your assigned accounts'
        }
        searchPlaceholder="Search opportunities..."
        onSearch={setSearchQuery}
        actions={[
          {
            label: 'New Opportunity',
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
              { value: 'identified', label: 'Identified' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'proposal', label: 'Proposal' },
              { value: 'negotiation', label: 'Negotiation' },
              { value: 'closed_won', label: 'Closed Won' },
              { value: 'closed_lost', label: 'Closed Lost' },
              { value: 'on_hold', label: 'On Hold' },
            ],
            onChange: setStageFilter,
          },
          {
            label: 'Type',
            value: typeFilter,
            options: [
              { value: 'all', label: 'All Types' },
              { value: 'upsell', label: 'Upsell' },
              { value: 'cross_sell', label: 'Cross Sell' },
              { value: 'renewal_expansion', label: 'Renewal Expansion' },
              { value: 'new_product', label: 'New Product' },
              { value: 'new_region', label: 'New Region' },
            ],
            onChange: setTypeFilter,
          },
        ]}
      />

      {/* Pipeline Summary */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Pipeline</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(pipelineMetrics.totalPipeline, { compact: true })}</p>
            <p className="text-sm text-gray-400 mt-1">
              {pipelineMetrics.totalCount} opportunities
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Weighted Pipeline</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(pipelineMetrics.weightedPipeline, { compact: true })}</p>
            <p className="text-sm text-gray-400 mt-1">
              Based on probability
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Closed Won (YTD)</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(pipelineMetrics.closedWon, { compact: true })}</p>
            <p className="text-sm text-gray-400 mt-1">
              {pipelineMetrics.wonCount} deals
            </p>
          </div>
        </div>
        
        {/* Stage Breakdown */}
        <div className="grid grid-cols-7 gap-3 mt-4">
          {stages.map(stage => {
            const stageOpportunities = opportunities.filter(o => o.stage === stage);
            const count = stageOpportunities.length;
            const totalArr = stageOpportunities.reduce((sum, o) => sum + o.potential_arr, 0);
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
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs font-medium uppercase mt-1">{getOpportunityStageLabel(stage)}</p>
                <p className="text-sm mt-1">{formatCurrency(totalArr, { compact: true })}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOpportunities.map((opportunity) => {
            const isClosed = opportunity.stage === 'closed_won' || opportunity.stage === 'closed_lost';
            const assignedCsm = users.find(u => u.id === opportunity.assigned_csm_id);
            
            return (
              <div
                key={opportunity.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => { setSelectedOpportunity(opportunity); setDetailModalOpen(true); }}
              >
                <div className="flex items-start justify-between">
                  <div className={cn(
                    'p-2 rounded-lg',
                    getStageColor(opportunity.stage).split(' ')[0]
                  )}>
                    {getOpportunityTypeIcon(opportunity.opportunity_type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold border',
                      getStageColor(opportunity.stage)
                    )}>
                      {getOpportunityStageLabel(opportunity.stage)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedOpportunity(opportunity); setDetailModalOpen(true); }}>
                          <FilePlus className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleEditClick(opportunity); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAddNoteClick(opportunity); }}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleUpdateValueClick(opportunity); }}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Update Value
                        </DropdownMenuItem>
                        {!isClosed && (
                          <>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleStageChange(opportunity, 'closed_won'); }}>
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                              Mark Won
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleStageChange(opportunity, 'closed_lost'); }}>
                              <X className="h-4 w-4 mr-2 text-red-600" />
                              Mark Lost
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteClick(opportunity); }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mt-3">
                  {opportunity.opportunity_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {opportunity.account?.name}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Potential ARR</p>
                    <p className="font-medium">{formatCurrency(opportunity.potential_arr, { compact: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expected Close</p>
                    <p className="font-medium">
                      {opportunity.expected_close_date ? formatDate(opportunity.expected_close_date) : '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Probability</span>
                    <span className="font-medium">{opportunity.probability}%</span>
                  </div>
                  <Progress value={opportunity.probability} className="h-2" />
                </div>

                {opportunity.trigger_type && (
                  <div className="mt-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-gray-600 capitalize">
                      Trigger: {opportunity.trigger_type.replace('_', ' ')}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {assignedCsm ? `${assignedCsm.first_name} ${assignedCsm.last_name}` : 'Unassigned'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Type: <span className="capitalize">{opportunity.opportunity_type.replace('_', ' ')}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4 text-lg">No opportunities found</p>
            <p className="text-gray-400 mt-1">
              {isAdmin 
                ? 'Try adjusting your filters or create a new opportunity'
                : 'No opportunities for your assigned accounts'}
            </p>
          </div>
        )}
      </div>

      {/* Add Opportunity Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Opportunity
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Account *</Label>
              <Select 
                value={opportunityForm.account_id} 
                onValueChange={(value) => setOpportunityForm({...opportunityForm, account_id: value})}
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
            
            <div className="space-y-2">
              <Label>Opportunity Name *</Label>
              <Input
                value={opportunityForm.opportunity_name}
                onChange={(e) => setOpportunityForm({...opportunityForm, opportunity_name: e.target.value})}
                placeholder="e.g., Q2 Upsell - Premium Features"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select 
                  value={opportunityForm.opportunity_type} 
                  onValueChange={(value) => setOpportunityForm({...opportunityForm, opportunity_type: value as OpportunityType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upsell">Upsell</SelectItem>
                    <SelectItem value="cross_sell">Cross Sell</SelectItem>
                    <SelectItem value="renewal_expansion">Renewal Expansion</SelectItem>
                    <SelectItem value="new_product">New Product</SelectItem>
                    <SelectItem value="new_region">New Region</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stage *</Label>
                <Select 
                  value={opportunityForm.stage} 
                  onValueChange={(value) => setOpportunityForm({...opportunityForm, stage: value as OpportunityStage})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identified">Identified</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Potential ARR ($) *</Label>
                <Input
                  type="number"
                  value={opportunityForm.potential_arr}
                  onChange={(e) => setOpportunityForm({...opportunityForm, potential_arr: e.target.value})}
                  placeholder="e.g., 150000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Potential MRR ($)</Label>
                <Input
                  type="number"
                  value={opportunityForm.potential_mrr}
                  onChange={(e) => setOpportunityForm({...opportunityForm, potential_mrr: e.target.value})}
                  placeholder="e.g., 12500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expected Close Date</Label>
                <Input
                  type="date"
                  value={opportunityForm.expected_close_date}
                  onChange={(e) => setOpportunityForm({...opportunityForm, expected_close_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={opportunityForm.probability}
                  onChange={(e) => setOpportunityForm({...opportunityForm, probability: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select 
                value={opportunityForm.trigger_type} 
                onValueChange={(value) => setOpportunityForm({...opportunityForm, trigger_type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usage_increase">Usage Increase</SelectItem>
                  <SelectItem value="product_feedback">Product Feedback</SelectItem>
                  <SelectItem value="new_region">New Region</SelectItem>
                  <SelectItem value="competitor_replacement">Competitor Replacement</SelectItem>
                  <SelectItem value="expansion_request">Expansion Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigned CSM</Label>
                <Select 
                  value={opportunityForm.assigned_csm_id} 
                  onValueChange={(value) => setOpportunityForm({...opportunityForm, assigned_csm_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CSM" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned AE</Label>
                <Select 
                  value={opportunityForm.assigned_ae_id} 
                  onValueChange={(value) => setOpportunityForm({...opportunityForm, assigned_ae_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AE" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={opportunityForm.notes}
                onChange={(e) => setOpportunityForm({...opportunityForm, notes: e.target.value})}
                placeholder="Add any notes about this opportunity..."
              />
            </div>
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Opportunity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Opportunity Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Opportunity
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Account *</Label>
              <Select 
                value={opportunityForm.account_id} 
                onValueChange={(value) => setOpportunityForm({...opportunityForm, account_id: value})}
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
            
            <div className="space-y-2">
              <Label>Opportunity Name *</Label>
              <Input
                value={opportunityForm.opportunity_name}
                onChange={(e) => setOpportunityForm({...opportunityForm, opportunity_name: e.target.value})}
                placeholder="e.g., Q2 Upsell - Premium Features"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select 
                  value={opportunityForm.opportunity_type} 
                  onValueChange={(value) => setOpportunityForm({...opportunityForm, opportunity_type: value as OpportunityType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upsell">Upsell</SelectItem>
                    <SelectItem value="cross_sell">Cross Sell</SelectItem>
                    <SelectItem value="renewal_expansion">Renewal Expansion</SelectItem>
                    <SelectItem value="new_product">New Product</SelectItem>
                    <SelectItem value="new_region">New Region</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stage *</Label>
                <Select 
                  value={opportunityForm.stage} 
                  onValueChange={(value) => setOpportunityForm({...opportunityForm, stage: value as OpportunityStage})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identified">Identified</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Potential ARR ($) *</Label>
                <Input
                  type="number"
                  value={opportunityForm.potential_arr}
                  onChange={(e) => setOpportunityForm({...opportunityForm, potential_arr: e.target.value})}
                  placeholder="e.g., 150000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Potential MRR ($)</Label>
                <Input
                  type="number"
                  value={opportunityForm.potential_mrr}
                  onChange={(e) => setOpportunityForm({...opportunityForm, potential_mrr: e.target.value})}
                  placeholder="e.g., 12500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expected Close Date</Label>
                <Input
                  type="date"
                  value={opportunityForm.expected_close_date}
                  onChange={(e) => setOpportunityForm({...opportunityForm, expected_close_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={opportunityForm.probability}
                  onChange={(e) => setOpportunityForm({...opportunityForm, probability: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select 
                value={opportunityForm.trigger_type} 
                onValueChange={(value) => setOpportunityForm({...opportunityForm, trigger_type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usage_increase">Usage Increase</SelectItem>
                  <SelectItem value="product_feedback">Product Feedback</SelectItem>
                  <SelectItem value="new_region">New Region</SelectItem>
                  <SelectItem value="competitor_replacement">Competitor Replacement</SelectItem>
                  <SelectItem value="expansion_request">Expansion Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigned CSM</Label>
                <Select 
                  value={opportunityForm.assigned_csm_id} 
                  onValueChange={(value) => setOpportunityForm({...opportunityForm, assigned_csm_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CSM" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned AE</Label>
                <Select 
                  value={opportunityForm.assigned_ae_id} 
                  onValueChange={(value) => setOpportunityForm({...opportunityForm, assigned_ae_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AE" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={opportunityForm.notes}
                onChange={(e) => setOpportunityForm({...opportunityForm, notes: e.target.value})}
                placeholder="Add any notes about this opportunity..."
              />
            </div>
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Update Opportunity
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
              <Trash2 className="h-5 w-5" />
              Delete Opportunity
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this opportunity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOpportunity && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">{selectedOpportunity.opportunity_name}</p>
              <p className="text-sm text-gray-500">
                Potential ARR: {formatCurrency(selectedOpportunity.potential_arr)}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Opportunity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <MessageSquare className="h-5 w-5" />
              Add Note
            </DialogTitle>
          </DialogHeader>
          
          {selectedOpportunity && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-gray-900">{selectedOpportunity.opportunity_name}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note..."
              rows={4}
            />
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={confirmAddNote}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Value Modal */}
      <Dialog open={valueModalOpen} onOpenChange={setValueModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <DollarSign className="h-5 w-5" />
              Update Potential ARR
            </DialogTitle>
          </DialogHeader>
          
          {selectedOpportunity && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-gray-900">{selectedOpportunity.opportunity_name}</p>
              <p className="text-sm text-gray-500">
                Current Value: {formatCurrency(selectedOpportunity.potential_arr)}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>New Potential ARR ($)</Label>
            <Input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter new value..."
            />
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setValueModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700" 
              onClick={confirmUpdateValue}
              disabled={!newValue}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Update Value
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opportunity Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedOpportunity && (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'p-3 rounded-xl',
                      getStageColor(selectedOpportunity.stage).split(' ')[0]
                    )}>
                      {getOpportunityTypeIcon(selectedOpportunity.opportunity_type)}
                    </div>
                    <div>
                      <div className={cn(
                        'inline-flex px-3 py-1 rounded-full text-xs font-semibold border',
                        getStageColor(selectedOpportunity.stage)
                      )}>
                        {getOpportunityStageLabel(selectedOpportunity.stage)}
                      </div>
                      <DialogHeader className="mt-1">
                        <DialogTitle className="text-xl">{selectedOpportunity.opportunity_name}</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-gray-600 mt-1">
                        {accounts.find(a => a.id === selectedOpportunity.account_id)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Opportunity Details</h4>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <span className="font-medium capitalize">{selectedOpportunity.opportunity_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Potential ARR</span>
                        <span className="font-medium">{formatCurrency(selectedOpportunity.potential_arr)}</span>
                      </div>
                      {selectedOpportunity.potential_mrr && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Potential MRR</span>
                          <span className="font-medium">{formatCurrency(selectedOpportunity.potential_mrr)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expected Close</span>
                        <span className="font-medium">
                          {selectedOpportunity.expected_close_date ? formatDate(selectedOpportunity.expected_close_date) : '-'}
                        </span>
                      </div>
                      {selectedOpportunity.trigger_type && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Trigger</span>
                          <span className="font-medium capitalize">{selectedOpportunity.trigger_type.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Probability</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-500">Win Probability</span>
                          <span className="font-medium">{selectedOpportunity.probability}%</span>
                        </div>
                        <Progress value={selectedOpportunity.probability} className="h-3" />
                        <p className="text-sm text-gray-500 mt-2">
                          Weighted value: {formatCurrency(selectedOpportunity.potential_arr * (selectedOpportunity.probability || 0) / 100)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                    <div className="bg-gray-50 p-4 rounded-lg min-h-[150px]">
                      {selectedOpportunity.notes ? (
                        <p className="text-gray-600">{selectedOpportunity.notes}</p>
                      ) : (
                        <p className="text-gray-400 italic">No notes added</p>
                      )}
                    </div>

                    <h4 className="font-semibold text-gray-900 mt-6 mb-3">Assignment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">CSM</span>
                        <span className="font-medium">
                          {selectedOpportunity.assigned_csm_id 
                            ? `${users.find(u => u.id === selectedOpportunity.assigned_csm_id)?.first_name || ''} ${users.find(u => u.id === selectedOpportunity.assigned_csm_id)?.last_name || ''}`
                            : 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Account Executive</span>
                        <span className="font-medium">
                          {selectedOpportunity.assigned_ae_id 
                            ? `${users.find(u => u.id === selectedOpportunity.assigned_ae_id)?.first_name || ''} ${users.find(u => u.id === selectedOpportunity.assigned_ae_id)?.last_name || ''}`
                            : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedOpportunity.stage !== 'closed_won' && selectedOpportunity.stage !== 'closed_lost' && (
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => { setDetailModalOpen(false); handleAddNoteClick(selectedOpportunity); }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => { setDetailModalOpen(false); handleUpdateValueClick(selectedOpportunity); }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Update Value
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => { setDetailModalOpen(false); handleStageChange(selectedOpportunity, 'closed_won'); }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Won
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => { setDetailModalOpen(false); handleStageChange(selectedOpportunity, 'closed_lost'); }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Mark Lost
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
