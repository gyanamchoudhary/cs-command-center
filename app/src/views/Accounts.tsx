import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useActivities } from '@/hooks/useActivities';
import { 
  getAccounts, assignAccount, setCurrentUser
} from '@/lib/api';
import type { AccountFilters } from '@/types';
import { users, accounts as allAccounts } from '@/data/sampleData';
import { Header } from '@/components/layout/Header';
import { HealthScoreBadge } from '@/components/shared/HealthScoreBadge';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AdminOnly } from '@/components/permissions/PermissionGuard';
import { toast } from 'sonner';
import { 
  Plus, MoreHorizontal, Building2, Edit, FilePlus, Trash2, 
  Filter, Search, X, AlertTriangle, Download, Phone, Users, Mail, CheckSquare,
  UserPlus
} from 'lucide-react';
import type { Account, AccountStatus, AccountSegment, HealthStatus, ChurnRisk, ActivityType, Priority } from '@/types';

// Bulk edit fields type
interface BulkEditFields {
  status?: AccountStatus;
  health_status?: HealthStatus;
  segment?: AccountSegment;
  primary_csm_id?: string;
  region?: string;
}

export function Accounts() {
  const { user } = useAuth();
  const { 
    editAccount,
    softDeleteAccount, 
    bulkSoftDeleteAccounts,
    bulkEditAccounts,
  } = useAccounts();
  
  const { addActivity } = useActivities();
  
  const isAdmin = user?.role === 'admin';
  
  // Set current user for API
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);
  
  // Data state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AccountFilters>({
    region: undefined,
    status: undefined,
    health_status: undefined,
    segment: undefined,
    owner_id: undefined,
    churn_risk: undefined,
  });
  
  // Bulk selection
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    industry: '',
    region: '',
    segment: '' as AccountSegment,
    arr: '',
    mrr: '',
    pricing_plan: '',
    primary_csm_id: '',
    status: '' as AccountStatus,
    health_status: '' as HealthStatus,
    churn_risk: '' as ChurnRisk,
  });
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  
  // Log Activity modal states
  const [logActivityModalOpen, setLogActivityModalOpen] = useState(false);
  const [accountForActivity, setAccountForActivity] = useState<Account | null>(null);
  const [activityForm, setActivityForm] = useState({
    activity_type: 'call' as ActivityType,
    title: '',
    summary: '',
    scheduled_at: '',
    priority: 'medium' as Priority,
  });
  
  // Assign Account modal (Admin only)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [accountToAssign, setAccountToAssign] = useState<Account | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSecondary, setIsSecondary] = useState(false);
  
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkEditFields, setBulkEditFields] = useState<BulkEditFields>({});
  
  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      const response = await getAccounts({
        search: searchQuery,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      
      if (response.success && response.data) {
        setAccounts(response.data.data);
        setTotalCount(response.data.total);
      } else {
        toast.error(response.error || 'Failed to load accounts');
      }
      setLoading(false);
    };
    
    fetchAccounts();
  }, [searchQuery, filters]);
  
  // Unique values for filters
  const regions = useMemo(() => [...new Set(allAccounts.map(a => a.region))], []);
  const owners = useMemo(() => [...new Set(allAccounts.map(a => a.primary_csm_id).filter((id): id is string => !!id))], []);
  
  // Toggle account selection
  const toggleSelection = (accountId: string) => {
    const newSelection = new Set(selectedAccounts);
    if (newSelection.has(accountId)) {
      newSelection.delete(accountId);
    } else {
      newSelection.add(accountId);
    }
    setSelectedAccounts(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };
  
  // Toggle all selection
  const toggleAllSelection = () => {
    if (selectedAccounts.size === accounts.length) {
      setSelectedAccounts(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedAccounts(new Set(accounts.map(a => a.id)));
      setShowBulkActions(true);
    }
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedAccounts(new Set());
    setShowBulkActions(false);
  };
  
  // Handle edit
  const handleEditClick = (account: Account) => {
    setAccountToEdit(account);
    setEditForm({
      name: account.name,
      industry: account.industry || '',
      region: account.region,
      segment: account.segment,
      arr: account.arr.toString(),
      mrr: account.mrr.toString(),
      pricing_plan: account.pricing_plan || '',
      primary_csm_id: account.primary_csm_id || '',
      status: account.status,
      health_status: account.health_status || 'green',
      churn_risk: account.churn_risk || 'low',
    });
    setEditModalOpen(true);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountToEdit && user) {
      const result = editAccount(accountToEdit.id, {
        name: editForm.name,
        industry: editForm.industry,
        region: editForm.region,
        segment: editForm.segment,
        arr: parseInt(editForm.arr) || 0,
        mrr: parseInt(editForm.mrr) || 0,
        pricing_plan: editForm.pricing_plan,
        primary_csm_id: editForm.primary_csm_id,
        status: editForm.status,
        health_status: editForm.health_status,
        churn_risk: editForm.churn_risk,
      }, user);
      
      if (result.success) {
        // Refresh accounts
        setAccounts(prev => prev.map(a => 
          a.id === accountToEdit.id 
            ? { ...a, ...editForm, arr: parseInt(editForm.arr) || 0, mrr: parseInt(editForm.mrr) || 0 }
            : a
        ));
        setEditModalOpen(false);
        setAccountToEdit(null);
      }
    }
  };
  
  // Handle log activity
  const handleLogActivityClick = (account: Account) => {
    setAccountForActivity(account);
    setActivityForm({
      activity_type: 'call',
      title: '',
      summary: '',
      scheduled_at: '',
      priority: 'medium',
    });
    setLogActivityModalOpen(true);
  };
  
  const handleLogActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountForActivity && user) {
      const result = addActivity({
        account_id: accountForActivity.id,
        owner_id: user.id,
        activity_type: activityForm.activity_type,
        title: activityForm.title,
        summary: activityForm.summary,
        scheduled_at: activityForm.scheduled_at || new Date().toISOString(),
        is_completed: true,
        priority: activityForm.priority,
      }, user);
      
      if (result.success) {
        toast.success(`Activity "${activityForm.title}" logged for ${accountForActivity.name}`);
        setLogActivityModalOpen(false);
        setAccountForActivity(null);
        setActivityForm({
          activity_type: 'call',
          title: '',
          summary: '',
          scheduled_at: '',
          priority: 'medium',
        });
      }
    }
  };
  
  // Handle assign account (Admin only)
  const handleAssignClick = (account: Account) => {
    setAccountToAssign(account);
    setSelectedUserId('');
    setIsSecondary(false);
    setAssignModalOpen(true);
  };
  
  const handleAssignSubmit = async () => {
    if (accountToAssign && selectedUserId) {
      const response = await assignAccount(accountToAssign.id, selectedUserId, isSecondary);
      
      if (response.success) {
        toast.success(`Account assigned to ${users.find(u => u.id === selectedUserId)?.first_name}`);
        setAssignModalOpen(false);
        setAccountToAssign(null);
        // Refresh accounts
        const refreshResponse = await getAccounts({ search: searchQuery, filters });
        if (refreshResponse.success && refreshResponse.data) {
          setAccounts(refreshResponse.data.data);
        }
      } else {
        toast.error(response.error || 'Failed to assign account');
      }
    }
  };
  
  // Handle single delete
  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (accountToDelete && user) {
      const result = softDeleteAccount(accountToDelete.id, user, isAdmin);
      if (result.success) {
        setAccounts(prev => prev.filter(a => a.id !== accountToDelete.id));
        setDeleteModalOpen(false);
        setAccountToDelete(null);
      }
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    setBulkDeleteModalOpen(true);
  };
  
  const confirmBulkDelete = () => {
    if (user && selectedAccounts.size > 0) {
      bulkSoftDeleteAccounts(Array.from(selectedAccounts), user, isAdmin);
      setAccounts(prev => prev.filter(a => !selectedAccounts.has(a.id)));
      setBulkDeleteModalOpen(false);
      clearSelection();
    }
  };
  
  // Handle bulk edit
  const handleBulkEdit = () => {
    setBulkEditFields({});
    setBulkEditModalOpen(true);
  };
  
  const confirmBulkEdit = () => {
    if (user && selectedAccounts.size > 0 && Object.keys(bulkEditFields).length > 0) {
      bulkEditAccounts(Array.from(selectedAccounts), bulkEditFields, user, isAdmin);
      // Update local state
      setAccounts(prev => prev.map(a => 
        selectedAccounts.has(a.id) 
          ? { ...a, ...bulkEditFields, updated_at: new Date().toISOString() }
          : a
      ));
      setBulkEditModalOpen(false);
      clearSelection();
    } else {
      toast.error('Please select at least one field to update');
    }
  };
  
  // Clear filters
  const clearFilters = () => {
    setFilters({
      region: undefined,
      status: undefined,
      health_status: undefined,
      segment: undefined,
      owner_id: undefined,
      churn_risk: undefined,
    });
  };
  
  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Industry', 'Region', 'Segment', 'ARR', 'MRR', 'Health', 'Status', 'CSM', 'Renewal Date'];
    const rows = accounts.map(a => [
      a.name,
      a.industry || '',
      a.region,
      a.segment,
      a.arr,
      a.mrr,
      a.health_status || '',
      a.status,
      users.find(u => u.id === a.primary_csm_id)?.email || '',
      a.renewal_date || '',
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${accounts.length} accounts to CSV`);
  };

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
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header
        title={isAdmin ? 'All Accounts' : 'My Accounts'}
        subtitle={`${totalCount} ${isAdmin ? 'total' : 'assigned'} accounts • ${formatCurrency(accounts.reduce((sum, a) => sum + a.arr, 0), { compact: true })} ARR`}
        searchPlaceholder="Search accounts..."
        onSearch={setSearchQuery}
        actions={[
          {
            label: 'Filter',
            icon: <Filter className="h-4 w-4" />,
            onClick: () => setShowFilters(!showFilters),
            variant: showFilters ? 'default' : 'outline',
          },
          {
            label: 'Export',
            icon: <Download className="h-4 w-4" />,
            onClick: exportToCSV,
            variant: 'outline',
          },
          ...(isAdmin ? [{
            label: 'Add Account',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => toast.info('Add account - implement with modal'),
            variant: 'default' as const,
          }] : []),
        ]}
      />
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="grid grid-cols-6 gap-3">
            <Select 
              value={filters.region || ''} 
              onValueChange={(v) => setFilters((f: AccountFilters) => ({ ...f, region: v || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.status || ''} 
              onValueChange={(v) => setFilters((f: AccountFilters) => ({ ...f, status: (v as AccountStatus) || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.health_status || ''} 
              onValueChange={(v) => setFilters((f: AccountFilters) => ({ ...f, health_status: (v as HealthStatus) || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.segment || ''} 
              onValueChange={(v) => setFilters((f: AccountFilters) => ({ ...f, segment: (v as AccountSegment) || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="mid_market">Mid Market</SelectItem>
                <SelectItem value="smb">SMB</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.owner_id || ''} 
              onValueChange={(v) => setFilters((f: AccountFilters) => ({ ...f, owner_id: v || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                {owners.map(id => {
                  const u = users.find(user => user.id === id);
                  return u ? (
                    <SelectItem key={id} value={id}>{u.first_name} {u.last_name}</SelectItem>
                  ) : null;
                })}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.churn_risk || ''} 
              onValueChange={(v) => setFilters((f: AccountFilters) => ({ ...f, churn_risk: (v as ChurnRisk) || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Churn Risk" />
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
      )}

      {/* Bulk Actions Bar */}
      <AdminOnly>
        {showBulkActions && (
          <div className="bg-blue-50 border-b border-blue-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedAccounts.size} account{selectedAccounts.size !== 1 ? 's' : ''} selected
              </span>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Bulk Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </AdminOnly>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <AdminOnly>
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selectedAccounts.size === accounts.length && accounts.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                </AdminOnly>
                <TableHead className="font-semibold">Account Name</TableHead>
                <TableHead className="font-semibold">Health</TableHead>
                <TableHead className="font-semibold">ARR</TableHead>
                <TableHead className="font-semibold">CSM</TableHead>
                <TableHead className="font-semibold">Region</TableHead>
                <TableHead className="font-semibold">Segment</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow
                  key={account.id}
                  className={cn(
                    "cursor-pointer hover:bg-gray-50",
                    selectedAccounts.has(account.id) && "bg-blue-50"
                  )}
                >
                  <AdminOnly>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedAccounts.has(account.id)}
                        onCheckedChange={() => toggleSelection(account.id)}
                      />
                    </TableCell>
                  </AdminOnly>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{account.name}</p>
                        <p className="text-sm text-gray-500">{account.industry || 'No industry'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {account.health_score ? (
                      <HealthScoreBadge score={account.health_score} showLabel={false} />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatCurrency(account.arr, { compact: true })}</span>
                  </TableCell>
                  <TableCell>
                    {account.primary_csm_id ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={users.find(u => u.id === account.primary_csm_id)?.avatar_url}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm">
                          {users.find(u => u.id === account.primary_csm_id)?.first_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{account.region}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {account.segment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={account.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        account.status === 'active' && 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
                        account.status === 'churned' && 'bg-red-100 text-red-700 hover:bg-red-100',
                        account.status === 'paused' && 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                      )}
                    >
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleLogActivityClick(account);
                        }}>
                          <FilePlus className="h-4 w-4 mr-2" />
                          Log Activity
                        </DropdownMenuItem>
                        <AdminOnly>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(account);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleAssignClick(account);
                          }}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign to User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(account);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </DropdownMenuItem>
                        </AdminOnly>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {accounts.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="text-gray-500 mt-4 text-lg">
                {isAdmin ? 'No accounts found' : 'No accounts assigned to you'}
              </p>
              <p className="text-gray-400 mt-1">
                {isAdmin ? 'Try adjusting your search or filters' : 'Contact your admin to get accounts assigned'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Account Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="h-5 w-5 text-blue-600" />
              </div>
              Edit Account
            </DialogTitle>
          </DialogHeader>
          
          {accountToEdit && (
            <form onSubmit={handleEditSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Account Name *</Label>
                  <Input
                    id="edit_name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g. Acme Corporation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_industry">Industry</Label>
                  <Input
                    id="edit_industry"
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    placeholder="e.g. Manufacturing"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_region">Region *</Label>
                  <Select
                    value={editForm.region}
                    onValueChange={(value) => setEditForm({ ...editForm, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="EMEA">EMEA</SelectItem>
                      <SelectItem value="APAC">APAC</SelectItem>
                      <SelectItem value="LATAM">LATAM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_segment">Segment *</Label>
                  <Select
                    value={editForm.segment}
                    onValueChange={(value) => setEditForm({ ...editForm, segment: value as AccountSegment })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="mid_market">Mid Market</SelectItem>
                      <SelectItem value="smb">SMB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_arr">ARR ($) *</Label>
                  <Input
                    id="edit_arr"
                    type="number"
                    value={editForm.arr}
                    onChange={(e) => setEditForm({ ...editForm, arr: e.target.value })}
                    placeholder="e.g. 500000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_mrr">MRR ($) *</Label>
                  <Input
                    id="edit_mrr"
                    type="number"
                    value={editForm.mrr}
                    onChange={(e) => setEditForm({ ...editForm, mrr: e.target.value })}
                    placeholder="e.g. 41667"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_pricing_plan">Pricing Plan</Label>
                <Input
                  id="edit_pricing_plan"
                  value={editForm.pricing_plan}
                  onChange={(e) => setEditForm({ ...editForm, pricing_plan: e.target.value })}
                  placeholder="e.g. Enterprise Plus"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_primary_csm">Primary CSM *</Label>
                <Select
                  value={editForm.primary_csm_id}
                  onValueChange={(value) => setEditForm({ ...editForm, primary_csm_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign CSM" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.role === 'user' || u.role === 'admin').map(csm => (
                      <SelectItem key={csm.id} value={csm.id}>
                        {csm.first_name} {csm.last_name} ({csm.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value as AccountStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_health">Health Status</Label>
                  <Select
                    value={editForm.health_status}
                    onValueChange={(value) => setEditForm({ ...editForm, health_status: value as HealthStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select health" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_churn_risk">Churn Risk</Label>
                  <Select
                    value={editForm.churn_risk}
                    onValueChange={(value) => setEditForm({ ...editForm, churn_risk: value as ChurnRisk })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk" />
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

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Account
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Log Activity Modal */}
      <Dialog open={logActivityModalOpen} onOpenChange={setLogActivityModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FilePlus className="h-5 w-5" />
              Log Activity {accountForActivity && `for ${accountForActivity.name}`}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLogActivitySubmit} className="space-y-4 mt-4">
            <div>
              <Label>Activity Type *</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {[
                  { value: 'call', label: 'Call', icon: Phone },
                  { value: 'meeting', label: 'Meeting', icon: Users },
                  { value: 'email', label: 'Email', icon: Mail },
                  { value: 'task', label: 'Task', icon: CheckSquare },
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setActivityForm({...activityForm, activity_type: type.value as ActivityType})}
                      className={cn(
                        'flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-colors',
                        activityForm.activity_type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <Label>Title *</Label>
              <Input 
                placeholder="Activity title" 
                value={activityForm.title}
                onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>Summary</Label>
              <Textarea 
                placeholder="Brief summary of the activity" 
                value={activityForm.summary}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setActivityForm({...activityForm, summary: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select 
                value={activityForm.priority} 
                onValueChange={(value) => setActivityForm({...activityForm, priority: value as Priority})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setLogActivityModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <FilePlus className="h-4 w-4 mr-2" />
                Log Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Account Modal (Admin Only) */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign Account
            </DialogTitle>
            <DialogDescription>
              {accountToAssign && `Assign "${accountToAssign.name}" to a user`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select User *</Label>
              <Select 
                value={selectedUserId} 
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'user' && u.is_active).map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} - {u.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={isSecondary}
                onCheckedChange={(checked) => setIsSecondary(checked as boolean)}
              />
              <Label className="mb-0">Assign as Secondary CSM</Label>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignSubmit} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedUserId}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this account? This will move it to the trash.
              You can restore it later if needed.
            </DialogDescription>
          </DialogHeader>
          
          {accountToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">{accountToDelete.name}</p>
              <p className="text-sm text-gray-500">
                {accountToDelete.industry} • {accountToDelete.region}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ARR: {formatCurrency(accountToDelete.arr)}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={bulkDeleteModalOpen} onOpenChange={setBulkDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Bulk Delete Accounts
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAccounts.size} accounts? 
              This will move them to the trash.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-auto">
            <p className="text-sm font-medium text-gray-700 mb-2">Accounts to delete:</p>
            {Array.from(selectedAccounts).map(id => {
              const account = accounts.find(a => a.id === id);
              return account ? (
                <p key={id} className="text-sm text-gray-600">• {account.name}</p>
              ) : null;
            })}
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Move {selectedAccounts.size} to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Modal */}
      <Dialog open={bulkEditModalOpen} onOpenChange={setBulkEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Bulk Edit {selectedAccounts.size} Accounts
            </DialogTitle>
            <DialogDescription>
              Select the fields you want to update for all selected accounts.
              Only changed fields will be applied.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={bulkEditFields.status || ''} 
                  onValueChange={(v) => setBulkEditFields(f => ({ ...f, status: (v as AccountStatus) || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Health Status</Label>
                <Select 
                  value={bulkEditFields.health_status || ''} 
                  onValueChange={(v) => setBulkEditFields(f => ({ ...f, health_status: (v as HealthStatus) || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Segment</Label>
                <Select 
                  value={bulkEditFields.segment || ''} 
                  onValueChange={(v) => setBulkEditFields(f => ({ ...f, segment: (v as AccountSegment) || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="mid_market">Mid Market</SelectItem>
                    <SelectItem value="smb">SMB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Region</Label>
                <Select 
                  value={bulkEditFields.region || ''} 
                  onValueChange={(v) => setBulkEditFields(f => ({ ...f, region: v || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="EMEA">EMEA</SelectItem>
                    <SelectItem value="APAC">APAC</SelectItem>
                    <SelectItem value="LATAM">LATAM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Primary CSM</Label>
              <Select 
                value={bulkEditFields.primary_csm_id || ''} 
                onValueChange={(v) => setBulkEditFields(f => ({ ...f, primary_csm_id: v || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'user' || u.role === 'admin').map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBulkEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkEdit} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Update {selectedAccounts.size} Accounts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
