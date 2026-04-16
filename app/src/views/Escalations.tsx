import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { accounts, users, escalations as allEscalations } from '@/data/sampleData';
import { Header } from '@/components/layout/Header';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { formatDate, getRelativeTime, getEscalationStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  Plus, Clock, User, AlertTriangle, MessageSquare, CheckCircle, 
  ArrowRight, MoreVertical, Edit, Trash2, FilePlus
} from 'lucide-react';
import type { Escalation, EscalationType, EscalationSeverity, EscalationStatus } from '@/types';

// Colors for status
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-purple-100 text-purple-700 border-purple-200',
    pending_customer: 'bg-amber-100 text-amber-700 border-amber-200',
    pending_internal: 'bg-gray-100 text-gray-700 border-gray-200',
    resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const statuses: EscalationStatus[] = ['open', 'in_progress', 'pending_customer', 'pending_internal', 'resolved', 'closed'];

export function Escalations() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Data state
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  
  // Form states
  const [escalationForm, setEscalationForm] = useState({
    account_id: '',
    title: '',
    description: '',
    escalation_type: 'technical' as EscalationType,
    severity: 'medium' as EscalationSeverity,
    status: 'open' as EscalationStatus,
    sla_hours: '24',
    customer_impact: '',
    business_impact: '',
    assigned_to: '',
  });
  
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalateTo, setEscalateTo] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  
  // Load escalations with permission filtering
  useEffect(() => {
    setLoading(true);
    
    // Filter escalations based on user permissions
    let filteredEscalations = allEscalations;
    
    if (!isAdmin && user) {
      // Get user's assigned accounts
      const userAccountIds = accounts
        .filter(a => !a.is_deleted && (a.primary_csm_id === user.id || a.secondary_csm_id === user.id))
        .map(a => a.id);
      
      // Filter escalations for user's accounts
      filteredEscalations = allEscalations.filter(e => userAccountIds.includes(e.account_id));
    }
    
    setEscalations(filteredEscalations);
    setLoading(false);
  }, [isAdmin, user]);
  
  // Apply search and filters
  const filteredEscalations = escalations.filter(escalation => {
    const account = accounts.find(a => a.id === escalation.account_id);
    const matchesSearch = 
      escalation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      escalation.escalation_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || escalation.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || escalation.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });
  
  // Sort by severity (critical first) then by created date
  const sortedEscalations = [...filteredEscalations].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  // Calculate escalation metrics
  const escalationMetrics = {
    totalOpen: escalations.filter(e => e.status !== 'resolved' && e.status !== 'closed').length,
    criticalCount: escalations.filter(e => e.severity === 'critical' && e.status !== 'resolved' && e.status !== 'closed').length,
    highCount: escalations.filter(e => e.severity === 'high' && e.status !== 'resolved' && e.status !== 'closed').length,
    resolvedToday: escalations.filter(e => {
      if (e.status !== 'resolved' || !e.resolved_at) return false;
      const resolvedDate = new Date(e.resolved_at);
      const today = new Date();
      return resolvedDate.toDateString() === today.toDateString();
    }).length,
    nearingSLA: escalations.filter(e => {
      if (!e.sla_deadline || e.status === 'resolved' || e.status === 'closed') return false;
      const hoursUntil = (new Date(e.sla_deadline).getTime() - Date.now()) / (1000 * 60 * 60);
      return hoursUntil <= 4 && hoursUntil > 0;
    }).length,
  };
  
  // SLA Progress calculation
  const getSLAProgress = (escalation: Escalation) => {
    if (!escalation.sla_deadline || !escalation.started_at) return 0;
    const total = new Date(escalation.sla_deadline).getTime() - new Date(escalation.started_at).getTime();
    const elapsed = Date.now() - new Date(escalation.started_at).getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };
  
  const getSLAStatus = (escalation: Escalation) => {
    if (!escalation.sla_deadline) return 'normal';
    const progress = getSLAProgress(escalation);
    if (progress >= 100) return 'breached';
    if (progress >= 80) return 'warning';
    return 'normal';
  };
  
  // Generate escalation number
  const generateEscalationNumber = () => {
    const year = new Date().getFullYear();
    const count = escalations.length + 1;
    return `ESC-${year}-${String(count).padStart(3, '0')}`;
  };
  
  // Handle add escalation
  const handleAddClick = () => {
    setEscalationForm({
      account_id: '',
      title: '',
      description: '',
      escalation_type: 'technical',
      severity: 'medium',
      status: 'open',
      sla_hours: '24',
      customer_impact: '',
      business_impact: '',
      assigned_to: user?.id || '',
    });
    setAddModalOpen(true);
  };
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const slaHours = parseInt(escalationForm.sla_hours) || 24;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
    
    const newEscalation: Escalation = {
      id: `esc-${Date.now()}`,
      account_id: escalationForm.account_id,
      escalation_number: generateEscalationNumber(),
      title: escalationForm.title,
      description: escalationForm.description,
      escalation_type: escalationForm.escalation_type,
      severity: escalationForm.severity,
      status: escalationForm.status,
      sla_hours: slaHours,
      sla_deadline: slaDeadline,
      started_at: now,
      customer_impact: escalationForm.customer_impact || undefined,
      business_impact: escalationForm.business_impact || undefined,
      assigned_to: escalationForm.assigned_to || user?.id,
      reported_by: user?.id,
      created_at: now,
      updated_at: now,
    };
    
    allEscalations.push(newEscalation);
    setEscalations(prev => [...prev, newEscalation]);
    setAddModalOpen(false);
    toast.success('Escalation created successfully');
  };
  
  // Handle edit escalation
  const handleEditClick = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setEscalationForm({
      account_id: escalation.account_id,
      title: escalation.title,
      description: escalation.description,
      escalation_type: escalation.escalation_type,
      severity: escalation.severity,
      status: escalation.status,
      sla_hours: escalation.sla_hours?.toString() || '24',
      customer_impact: escalation.customer_impact || '',
      business_impact: escalation.business_impact || '',
      assigned_to: escalation.assigned_to || '',
    });
    setEditModalOpen(true);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscalation) return;
    
    const updatedEscalation: Escalation = {
      ...selectedEscalation,
      account_id: escalationForm.account_id,
      title: escalationForm.title,
      description: escalationForm.description,
      escalation_type: escalationForm.escalation_type,
      severity: escalationForm.severity,
      status: escalationForm.status,
      sla_hours: parseInt(escalationForm.sla_hours) || 24,
      customer_impact: escalationForm.customer_impact || undefined,
      business_impact: escalationForm.business_impact || undefined,
      assigned_to: escalationForm.assigned_to || undefined,
      updated_at: new Date().toISOString(),
    };
    
    // Update in allEscalations
    const index = allEscalations.findIndex(e => e.id === selectedEscalation.id);
    if (index !== -1) {
      allEscalations[index] = updatedEscalation;
    }
    
    setEscalations(prev => prev.map(e => e.id === selectedEscalation.id ? updatedEscalation : e));
    setEditModalOpen(false);
    setSelectedEscalation(null);
    toast.success('Escalation updated successfully');
  };
  
  // Handle delete escalation
  const handleDeleteClick = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (!selectedEscalation) return;
    
    const index = allEscalations.findIndex(e => e.id === selectedEscalation.id);
    if (index !== -1) {
      allEscalations.splice(index, 1);
    }
    
    setEscalations(prev => prev.filter(e => e.id !== selectedEscalation.id));
    setDeleteModalOpen(false);
    setSelectedEscalation(null);
    toast.success('Escalation deleted successfully');
  };
  
  // Handle resolve escalation
  const handleResolveClick = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setResolutionNotes('');
    setResolveModalOpen(true);
  };
  
  const confirmResolve = () => {
    if (!selectedEscalation) return;
    
    const updatedEscalation: Escalation = {
      ...selectedEscalation,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes || undefined,
      updated_at: new Date().toISOString(),
    };
    
    const index = allEscalations.findIndex(e => e.id === selectedEscalation.id);
    if (index !== -1) {
      allEscalations[index] = updatedEscalation;
    }
    
    setEscalations(prev => prev.map(e => e.id === selectedEscalation.id ? updatedEscalation : e));
    setResolveModalOpen(false);
    setSelectedEscalation(null);
    setResolutionNotes('');
    toast.success('Escalation resolved successfully');
  };
  
  // Handle escalate to higher level
  const handleEscalateClick = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setEscalateTo('');
    setEscalateModalOpen(true);
  };
  
  const confirmEscalate = () => {
    if (!selectedEscalation || !escalateTo) return;
    
    const updatedEscalation: Escalation = {
      ...selectedEscalation,
      escalated_to: escalateTo,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    };
    
    const index = allEscalations.findIndex(e => e.id === selectedEscalation.id);
    if (index !== -1) {
      allEscalations[index] = updatedEscalation;
    }
    
    setEscalations(prev => prev.map(e => e.id === selectedEscalation.id ? updatedEscalation : e));
    setEscalateModalOpen(false);
    setSelectedEscalation(null);
    setEscalateTo('');
    toast.success('Escalation forwarded to higher level');
  };
  
  // Handle add update
  const handleAddUpdateClick = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setUpdateNotes('');
    setUpdateModalOpen(true);
  };
  
  const confirmAddUpdate = () => {
    if (!selectedEscalation || !updateNotes.trim()) return;
    
    // In a real app, this would create an activity or update record
    // For now, we'll just update the escalation timestamp
    const updatedEscalation: Escalation = {
      ...selectedEscalation,
      updated_at: new Date().toISOString(),
    };
    
    const index = allEscalations.findIndex(e => e.id === selectedEscalation.id);
    if (index !== -1) {
      allEscalations[index] = updatedEscalation;
    }
    
    setEscalations(prev => prev.map(e => e.id === selectedEscalation.id ? updatedEscalation : e));
    setUpdateModalOpen(false);
    setSelectedEscalation(null);
    setUpdateNotes('');
    toast.success('Update added successfully');
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
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[...Array(5)].map((_, i) => (
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
        title={isAdmin ? 'Escalations' : 'My Escalations'}
        subtitle={isAdmin 
          ? 'Track and manage all customer escalations'
          : 'Track and manage escalations for your assigned accounts'
        }
        searchPlaceholder="Search escalations..."
        onSearch={setSearchQuery}
        actions={[
          {
            label: 'New Escalation',
            icon: <Plus className="h-4 w-4" />,
            onClick: handleAddClick,
            variant: 'default',
          },
        ]}
        filters={[
          {
            label: 'Severity',
            value: severityFilter,
            options: [
              { value: 'all', label: 'All Severities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ],
            onChange: setSeverityFilter,
          },
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'pending_customer', label: 'Pending Customer' },
              { value: 'pending_internal', label: 'Pending Internal' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Escalation Summary */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">
            {isAdmin ? 'Escalation Overview' : 'My Escalation Status'}
          </span>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Open Escalations</p>
            <p className="text-xl font-bold text-blue-600">{escalationMetrics.totalOpen}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Critical</p>
            <p className="text-xl font-bold text-red-600">{escalationMetrics.criticalCount}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">High Priority</p>
            <p className="text-xl font-bold text-orange-600">{escalationMetrics.highCount}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Resolved Today</p>
            <p className="text-xl font-bold text-emerald-600">{escalationMetrics.resolvedToday}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Nearing SLA</p>
            <p className="text-xl font-bold text-amber-600">{escalationMetrics.nearingSLA}</p>
          </div>
        </div>
        
        {/* Status Breakdown */}
        <div className="grid grid-cols-6 gap-3">
          {statuses.map(status => {
            const statusEscalations = escalations.filter(e => e.status === status);
            const count = statusEscalations.length;
            return (
              <div
                key={status}
                className={cn(
                  'p-3 rounded-lg border-2 text-center cursor-pointer transition-colors',
                  statusFilter === status ? 'ring-2 ring-blue-500 ring-offset-2' : '',
                  getStatusColor(status)
                )}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium uppercase mt-1">{getEscalationStatusLabel(status)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedEscalations.map((escalation) => {
            const account = accounts.find(a => a.id === escalation.account_id);
            const assignedUser = users.find(u => u.id === escalation.assigned_to);
            const slaProgress = getSLAProgress(escalation);
            const slaStatus = getSLAStatus(escalation);
            const isResolved = escalation.status === 'resolved' || escalation.status === 'closed';
            
            return (
              <div
                key={escalation.id}
                className={cn(
                  'bg-white rounded-xl border-l-4 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
                  escalation.severity === 'critical' && 'border-l-red-500',
                  escalation.severity === 'high' && 'border-l-orange-500',
                  escalation.severity === 'medium' && 'border-l-amber-500',
                  escalation.severity === 'low' && 'border-l-blue-500',
                  slaStatus === 'breached' && 'ring-2 ring-red-200',
                  slaStatus === 'warning' && 'ring-2 ring-amber-200'
                )}
                onClick={() => { setSelectedEscalation(escalation); setDetailModalOpen(true); }}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={escalation.severity} size="sm" />
                    <span className="text-xs text-gray-500 capitalize">
                      {escalation.escalation_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {slaStatus === 'breached' && (
                      <Badge variant="destructive" className="text-xs">SLA Breached</Badge>
                    )}
                    {slaStatus === 'warning' && !isResolved && (
                      <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">SLA Warning</Badge>
                    )}
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
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedEscalation(escalation); setDetailModalOpen(true); }}>
                          <FilePlus className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleEditClick(escalation); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!isResolved && (
                          <>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAddUpdateClick(escalation); }}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add Update
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleEscalateClick(escalation); }}>
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Escalate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleResolveClick(escalation); }}>
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                              Resolve
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteClick(escalation); }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Escalation Number & Title */}
                <p className="text-xs text-gray-400 mt-2">{escalation.escalation_number}</p>
                <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">
                  {escalation.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {account?.name}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {escalation.description}
                </p>

                {/* SLA Progress */}
                {escalation.sla_deadline && !isResolved && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={cn(
                        'flex items-center gap-1',
                        slaStatus === 'breached' && 'text-red-600 font-medium',
                        slaStatus === 'warning' && 'text-amber-600 font-medium'
                      )}>
                        <Clock className="h-3 w-3" />
                        {slaStatus === 'breached' ? 'SLA Breached' : `SLA: ${getRelativeTime(escalation.sla_deadline)}`}
                      </span>
                      <span className="text-gray-400">{escalation.sla_hours}h</span>
                    </div>
                    <Progress 
                      value={slaProgress} 
                      className={cn(
                        "h-1.5",
                        slaStatus === 'breached' && "bg-red-200",
                        slaStatus === 'warning' && "bg-amber-200"
                      )}
                    />
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      {assignedUser?.first_name || 'Unassigned'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {getEscalationStatusLabel(escalation.status)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {sortedEscalations.length === 0 && (
          <div className="text-center py-16">
            <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4 text-lg">No escalations found</p>
            <p className="text-gray-400 mt-1">
              {isAdmin 
                ? 'Try adjusting your filters or create a new escalation'
                : 'No escalations for your assigned accounts'}
            </p>
          </div>
        )}
      </div>

      {/* Add Escalation Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Escalation
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Account *</Label>
              <Select 
                value={escalationForm.account_id} 
                onValueChange={(value) => setEscalationForm({...escalationForm, account_id: value})}
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
              <Label>Title *</Label>
              <Input
                value={escalationForm.title}
                onChange={(e) => setEscalationForm({...escalationForm, title: e.target.value})}
                placeholder="Brief description of the escalation"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={escalationForm.description}
                onChange={(e) => setEscalationForm({...escalationForm, description: e.target.value})}
                placeholder="Detailed description of the issue..."
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select 
                  value={escalationForm.escalation_type} 
                  onValueChange={(value) => setEscalationForm({...escalationForm, escalation_type: value as EscalationType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="device">Device</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select 
                  value={escalationForm.severity} 
                  onValueChange={(value) => setEscalationForm({...escalationForm, severity: value as EscalationSeverity})}
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
              <div className="space-y-2">
                <Label>SLA Hours *</Label>
                <Input
                  type="number"
                  min="1"
                  value={escalationForm.sla_hours}
                  onChange={(e) => setEscalationForm({...escalationForm, sla_hours: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select 
                value={escalationForm.assigned_to} 
                onValueChange={(value) => setEscalationForm({...escalationForm, assigned_to: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
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
              <Label>Customer Impact</Label>
              <Textarea
                value={escalationForm.customer_impact}
                onChange={(e) => setEscalationForm({...escalationForm, customer_impact: e.target.value})}
                placeholder="Describe the impact on the customer..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Business Impact</Label>
              <Textarea
                value={escalationForm.business_impact}
                onChange={(e) => setEscalationForm({...escalationForm, business_impact: e.target.value})}
                placeholder="Describe the business impact..."
              />
            </div>
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Escalation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Escalation Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Escalation
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Account *</Label>
              <Select 
                value={escalationForm.account_id} 
                onValueChange={(value) => setEscalationForm({...escalationForm, account_id: value})}
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
              <Label>Title *</Label>
              <Input
                value={escalationForm.title}
                onChange={(e) => setEscalationForm({...escalationForm, title: e.target.value})}
                placeholder="Brief description of the escalation"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={escalationForm.description}
                onChange={(e) => setEscalationForm({...escalationForm, description: e.target.value})}
                placeholder="Detailed description of the issue..."
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select 
                  value={escalationForm.escalation_type} 
                  onValueChange={(value) => setEscalationForm({...escalationForm, escalation_type: value as EscalationType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="device">Device</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select 
                  value={escalationForm.severity} 
                  onValueChange={(value) => setEscalationForm({...escalationForm, severity: value as EscalationSeverity})}
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
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select 
                  value={escalationForm.status} 
                  onValueChange={(value) => setEscalationForm({...escalationForm, status: value as EscalationStatus})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending_customer">Pending Customer</SelectItem>
                    <SelectItem value="pending_internal">Pending Internal</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select 
                value={escalationForm.assigned_to} 
                onValueChange={(value) => setEscalationForm({...escalationForm, assigned_to: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
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
              <Label>Customer Impact</Label>
              <Textarea
                value={escalationForm.customer_impact}
                onChange={(e) => setEscalationForm({...escalationForm, customer_impact: e.target.value})}
                placeholder="Describe the impact on the customer..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Business Impact</Label>
              <Textarea
                value={escalationForm.business_impact}
                onChange={(e) => setEscalationForm({...escalationForm, business_impact: e.target.value})}
                placeholder="Describe the business impact..."
              />
            </div>
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Update Escalation
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
              Delete Escalation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this escalation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEscalation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">{selectedEscalation.title}</p>
              <p className="text-sm text-gray-500">{selectedEscalation.escalation_number}</p>
            </div>
          )}
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Escalation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Escalation Modal */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              Resolve Escalation
            </DialogTitle>
            <DialogDescription>
              Add resolution notes before marking this escalation as resolved.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEscalation && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-gray-900">{selectedEscalation.title}</p>
              <p className="text-sm text-gray-500">{selectedEscalation.escalation_number}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Resolution Notes *</Label>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe how the escalation was resolved..."
              rows={4}
            />
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700" 
              onClick={confirmResolve}
              disabled={!resolutionNotes.trim()}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate to Higher Level Modal */}
      <Dialog open={escalateModalOpen} onOpenChange={setEscalateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <ArrowRight className="h-5 w-5" />
              Escalate to Higher Level
            </DialogTitle>
            <DialogDescription>
              Forward this escalation to a higher level for attention.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEscalation && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-gray-900">{selectedEscalation.title}</p>
              <p className="text-sm text-gray-500">{selectedEscalation.escalation_number}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Escalate To *</Label>
            <Select 
              value={escalateTo} 
              onValueChange={setEscalateTo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user to escalate to" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers
                  .filter(u => u.id !== selectedEscalation?.assigned_to)
                  .map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.role})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700" 
              onClick={confirmEscalate}
              disabled={!escalateTo}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Escalate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Update Modal */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <MessageSquare className="h-5 w-5" />
              Add Update
            </DialogTitle>
            <DialogDescription>
              Add a progress update or note to this escalation.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEscalation && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-gray-900">{selectedEscalation.title}</p>
              <p className="text-sm text-gray-500">{selectedEscalation.escalation_number}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Update Notes *</Label>
            <Textarea
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="Enter your update..."
              rows={4}
            />
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={confirmAddUpdate}
              disabled={!updateNotes.trim()}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalation Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedEscalation && (
            <>
              {/* Header */}
              <div className={cn(
                'p-6 border-b',
                selectedEscalation.severity === 'critical' && 'bg-red-50 border-red-200',
                selectedEscalation.severity === 'high' && 'bg-orange-50 border-orange-200',
                selectedEscalation.severity === 'medium' && 'bg-amber-50 border-amber-200',
                selectedEscalation.severity === 'low' && 'bg-blue-50 border-blue-200',
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={selectedEscalation.severity} />
                      <span className="text-sm text-gray-500">
                        {selectedEscalation.escalation_number}
                      </span>
                    </div>
                    <DialogHeader className="mt-2">
                      <DialogTitle className="text-xl">{selectedEscalation.title}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 mt-1">
                      {accounts.find(a => a.id === selectedEscalation.account_id)?.name}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {getEscalationStatusLabel(selectedEscalation.status)}
                  </Badge>
                </div>
              </div>

              <div className="p-6 overflow-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                    <p className="text-gray-600">{selectedEscalation.description}</p>

                    {selectedEscalation.customer_impact && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Customer Impact</h4>
                        <p className="text-gray-600">{selectedEscalation.customer_impact}</p>
                      </div>
                    )}

                    {selectedEscalation.business_impact && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Business Impact</h4>
                        <p className="text-gray-600">{selectedEscalation.business_impact}</p>
                      </div>
                    )}

                    {selectedEscalation.root_cause && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Root Cause</h4>
                        <p className="text-gray-600">{selectedEscalation.root_cause}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Details</h4>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <span className="font-medium capitalize">{selectedEscalation.escalation_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created</span>
                        <span className="font-medium">{formatDate(selectedEscalation.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reported By</span>
                        <span className="font-medium">
                          {users.find(u => u.id === selectedEscalation.reported_by)?.first_name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Assigned To</span>
                        <span className="font-medium">
                          {users.find(u => u.id === selectedEscalation.assigned_to)?.first_name || 'Unassigned'}
                        </span>
                      </div>
                      {selectedEscalation.escalated_to && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Escalated To</span>
                          <span className="font-medium">
                            {users.find(u => u.id === selectedEscalation.escalated_to)?.first_name || 'Unknown'}
                          </span>
                        </div>
                      )}
                      {selectedEscalation.sla_deadline && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">SLA Deadline</span>
                          <span className={cn(
                            'font-medium',
                            getSLAStatus(selectedEscalation) === 'breached' && 'text-red-600',
                            getSLAStatus(selectedEscalation) === 'warning' && 'text-amber-600'
                          )}>
                            {formatDate(selectedEscalation.sla_deadline)}
                          </span>
                        </div>
                      )}
                      {selectedEscalation.resolved_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Resolved At</span>
                          <span className="font-medium text-emerald-600">
                            {formatDate(selectedEscalation.resolved_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedEscalation.resolution_notes && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Resolution Notes</h4>
                        <div className="bg-emerald-50 p-4 rounded-lg">
                          <p className="text-gray-600">{selectedEscalation.resolution_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedEscalation.status !== 'resolved' && selectedEscalation.status !== 'closed' && (
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => { setDetailModalOpen(false); handleAddUpdateClick(selectedEscalation); }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Update
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => { setDetailModalOpen(false); handleEscalateClick(selectedEscalation); }}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Escalate
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => { setDetailModalOpen(false); handleResolveClick(selectedEscalation); }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
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
