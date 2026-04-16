import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useActivities, formatDateTimeDisplay } from '@/hooks/useActivities';
import { getActivities, setCurrentUser } from '@/lib/api';
import { accounts, users } from '@/data/sampleData';
import { Header } from '@/components/layout/Header';
import { formatDate, getRelativeTime, getActivityTypeLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { SimpleDateTimeInput, detectTimezone } from '@/components/ui/DateTimePicker';
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
import { UserOnly } from '@/components/permissions/PermissionGuard';
import { toast } from 'sonner';
import { 
  Plus, Phone, Users, Mail, ArrowRight, MessageSquare, Calendar, 
  CheckSquare, FileText, AlertTriangle, Clock, MoreVertical, 
  Pencil, Trash2, X, Edit
} from 'lucide-react';
import type { Activity, ActivityType, Priority, ActivityFilters } from '@/types';

// Activity types for logging
const activityTypes = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'task', label: 'Task', icon: CheckSquare },
  { value: 'note', label: 'Note', icon: FileText },
  { value: 'qbr', label: 'QBR', icon: Calendar },
  { value: 'escalation', label: 'Escalation', icon: AlertTriangle },
];

type SortOption = 'newest' | 'oldest' | 'today' | 'this_week' | 'this_month';

export function Activities() {
  const { user } = useAuth();
  const { 
    addActivity, 
    editActivity, 
    deleteActivity, 
    bulkEditActivities,
    canEditActivity, 
    canDeleteActivity, 
  } = useActivities();
  
  const isAdmin = user?.role === 'admin';
  const userId = user?.id || '';
  const userTimezone = user?.timezone || detectTimezone();
  
  // Set current user for API
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);
  
  // Data state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [accountFilter, setAccountFilter] = useState('all');
  
  // Bulk selection (for users only)
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Log activity form state
  const [activityForm, setActivityForm] = useState({
    account_id: '',
    activity_type: 'call' as ActivityType,
    title: '',
    summary: '',
    scheduled_at: '',
    priority: 'medium' as Priority,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    summary: '',
    outcome: '',
    next_steps: '',
    scheduled_at: '',
    is_completed: false,
  });

  // Bulk edit form state
  const [bulkEditForm, setBulkEditForm] = useState({
    scheduled_at: '',
    summary: '',
    is_completed: undefined as boolean | undefined,
  });

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      
      const filters: ActivityFilters = {};
      if (typeFilter !== 'all') {
        filters.activity_type = typeFilter as ActivityType;
      }
      if (accountFilter !== 'all') {
        filters.account_id = accountFilter;
      }
      
      // Date filters based on sort option
      const now = new Date();
      if (sortOption === 'today') {
        filters.date_from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (sortOption === 'this_week') {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        filters.date_from = weekStart.toISOString();
      } else if (sortOption === 'this_month') {
        filters.date_from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      }
      
      const response = await getActivities({
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      
      if (response.success && response.data) {
        let filtered = response.data.data;
        
        // Apply search filter client-side
        if (searchQuery.trim()) {
          const lowerSearch = searchQuery.toLowerCase();
          filtered = filtered.filter(a => 
            a.title.toLowerCase().includes(lowerSearch) ||
            accounts.find(acc => acc.id === a.account_id)?.name.toLowerCase().includes(lowerSearch)
          );
        }
        
        // Apply sorting
        if (sortOption === 'oldest') {
          filtered = filtered.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        } else {
          // Default: newest first
          filtered = filtered.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        
        setActivities(filtered);
        setTotalCount(filtered.length);
      } else {
        toast.error(response.error || 'Failed to load activities');
      }
      setLoading(false);
    };
    
    fetchActivities();
  }, [searchQuery, typeFilter, accountFilter, sortOption]);

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown';
  };

  const getUserName = (userId?: string) => {
    if (!userId) return 'System';
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      call: <Phone className="h-5 w-5" />,
      meeting: <Users className="h-5 w-5" />,
      email: <Mail className="h-5 w-5" />,
      follow_up: <ArrowRight className="h-5 w-5" />,
      internal_discussion: <MessageSquare className="h-5 w-5" />,
      qbr: <Calendar className="h-5 w-5" />,
      escalation: <AlertTriangle className="h-5 w-5" />,
      note: <FileText className="h-5 w-5" />,
      task: <CheckSquare className="h-5 w-5" />,
    };
    return icons[type] || <Calendar className="h-5 w-5" />;
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

  // Toggle activity selection
  const toggleSelection = (activityId: string) => {
    const newSelection = new Set(selectedActivities);
    if (newSelection.has(activityId)) {
      newSelection.delete(activityId);
    } else {
      newSelection.add(activityId);
    }
    setSelectedActivities(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedActivities(new Set());
    setShowBulkActions(false);
  };

  // Handle log activity submission
  const handleLogActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && activityForm.account_id) {
      const result = addActivity({
        account_id: activityForm.account_id,
        owner_id: user.id,
        activity_type: activityForm.activity_type,
        title: activityForm.title,
        summary: activityForm.summary,
        scheduled_at: activityForm.scheduled_at || new Date().toISOString(),
        is_completed: true,
        priority: activityForm.priority,
      }, user);

      if (result.success) {
        const accountName = getAccountName(activityForm.account_id);
        toast.success(`Activity "${activityForm.title}" logged for ${accountName}`);
        setShowCreateModal(false);
        
        // Reset form
        setActivityForm({
          account_id: '',
          activity_type: 'call',
          title: '',
          summary: '',
          scheduled_at: '',
          priority: 'medium',
        });
        
        // Refresh activities
        const refreshResponse = await getActivities();
        if (refreshResponse.success && refreshResponse.data) {
          setActivities(refreshResponse.data.data);
        }
      } else {
        toast.error(result.error || 'Failed to log activity');
      }
    }
  };

  // Handle edit button click
  const handleEditClick = (activity: Activity) => {
    if (!user) return;
    
    if (!canEditActivity(activity.id, user.id, isAdmin)) {
      toast.error('You can only edit your own activities');
      return;
    }
    
    setSelectedActivity(activity);
    setEditForm({
      title: activity.title,
      summary: activity.summary || '',
      outcome: activity.outcome || '',
      next_steps: activity.next_steps || '',
      scheduled_at: activity.scheduled_at || '',
      is_completed: activity.is_completed,
    });
    setShowEditModal(true);
  };

  // Handle edit submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedActivity) return;

    const result = editActivity(
      selectedActivity.id,
      {
        title: editForm.title,
        summary: editForm.summary,
        outcome: editForm.outcome,
        next_steps: editForm.next_steps,
        scheduled_at: editForm.scheduled_at,
        is_completed: editForm.is_completed,
      },
      user,
      isAdmin
    );

    if (result.success) {
      // Update local state
      setActivities(prev => prev.map(a => 
        a.id === selectedActivity.id 
          ? { ...a, ...editForm, updated_at: new Date().toISOString() }
          : a
      ));
      setShowEditModal(false);
      setSelectedActivity(null);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (activity: Activity) => {
    if (!user) return;
    
    if (!canDeleteActivity(activity.id, user.id, isAdmin)) {
      toast.error('You do not have permission to delete this activity');
      return;
    }
    
    setSelectedActivity(activity);
    setShowDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!user || !selectedActivity) return;

    const result = deleteActivity(
      selectedActivity.id,
      user,
      isAdmin
    );

    if (result.success) {
      setActivities(prev => prev.filter(a => a.id !== selectedActivity.id));
      setShowDeleteDialog(false);
      setSelectedActivity(null);
    }
  };

  // Handle bulk edit
  const handleBulkEdit = () => {
    setBulkEditForm({
      scheduled_at: '',
      summary: '',
      is_completed: undefined,
    });
    setShowBulkEditModal(true);
  };

  // Handle bulk edit submission
  const handleBulkEditSubmit = () => {
    if (!user || selectedActivities.size === 0) return;

    const updates: Partial<Activity> = {};
    
    if (bulkEditForm.scheduled_at) {
      updates.scheduled_at = bulkEditForm.scheduled_at;
    }
    if (bulkEditForm.summary) {
      updates.summary = bulkEditForm.summary;
    }
    if (bulkEditForm.is_completed !== undefined) {
      updates.is_completed = bulkEditForm.is_completed;
    }

    if (Object.keys(updates).length === 0) {
      toast.error('Please select at least one field to update');
      return;
    }

    bulkEditActivities(Array.from(selectedActivities), updates, user, isAdmin);
    
    // Update local state
    setActivities(prev => prev.map(a => 
      selectedActivities.has(a.id) 
        ? { ...a, ...updates, updated_at: new Date().toISOString() }
        : a
    ));
    
    setShowBulkEditModal(false);
    clearSelection();
  };

  // Get sort label
  const getSortLabel = (option: SortOption) => {
    const labels: Record<SortOption, string> = {
      newest: 'Newest First',
      oldest: 'Oldest First',
      today: 'Today',
      this_week: 'This Week',
      this_month: 'This Month',
    };
    return labels[option];
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
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header
        title="Activities"
        subtitle={`${totalCount} ${isAdmin ? 'total' : 'your'} activities`}
        searchPlaceholder="Search activities..."
        onSearch={setSearchQuery}
        actions={[
          {
            label: 'Log Activity',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowCreateModal(true),
            variant: 'default',
          },
        ]}
        filters={[
          {
            label: 'Account',
            value: accountFilter,
            options: [
              { value: 'all', label: 'All Accounts' },
              ...accounts.map(a => ({ value: a.id, label: a.name })),
            ],
            onChange: setAccountFilter,
          },
          {
            label: 'Type',
            value: typeFilter,
            options: [
              { value: 'all', label: 'All Types' },
              { value: 'call', label: 'Call' },
              { value: 'meeting', label: 'Meeting' },
              { value: 'email', label: 'Email' },
              { value: 'task', label: 'Task' },
              { value: 'qbr', label: 'QBR' },
              { value: 'escalation', label: 'Escalation' },
            ],
            onChange: setTypeFilter,
          },
          {
            label: 'Sort',
            value: sortOption,
            options: [
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'today', label: 'Today' },
              { value: 'this_week', label: 'This Week' },
              { value: 'this_month', label: 'This Month' },
            ],
            onChange: (val) => setSortOption(val as SortOption),
          },
        ]}
      />

      {/* Bulk Actions Bar - Only for Users (not Admin) */}
      <UserOnly>
        {showBulkActions && (
          <div className="bg-blue-50 border-b border-blue-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedActivities.size} activity{selectedActivities.size !== 1 ? 'ies' : ''} selected
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
            </div>
          </div>
        )}
      </UserOnly>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
              {sortOption !== 'newest' && ` • ${getSortLabel(sortOption)}`}
              {!isAdmin && ' • Your activities only'}
            </p>
          </div>

          <div className="space-y-4">
            {activities.map((activity, index) => {
              const isFirstOfDay = index === 0 || 
                new Date(activity.created_at).toDateString() !== 
                new Date(activities[index - 1].created_at).toDateString();
              
              const canEdit = user ? canEditActivity(activity.id, user.id, isAdmin) : false;
              const canDelete = user ? canDeleteActivity(activity.id, user.id, isAdmin) : false;
              const isOwnActivity = activity.owner_id === userId;
              
              return (
                <div key={activity.id}>
                  {isFirstOfDay && (
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-sm text-gray-500 font-medium">
                        {formatDate(activity.created_at)}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                  
                  <div className="flex gap-4 group">
                    {/* Selection checkbox (users only) */}
                    {!isAdmin && isOwnActivity && (
                      <div className="flex items-start pt-3">
                        <Checkbox 
                          checked={selectedActivities.has(activity.id)}
                          onCheckedChange={() => toggleSelection(activity.id)}
                        />
                      </div>
                    )}
                    
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={cn('p-3 rounded-xl', getActivityColor(activity.activity_type))}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="w-0.5 flex-1 bg-gray-200 mt-2 group-last:hidden" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                              <Badge variant="outline" className="text-xs capitalize">
                                {getActivityTypeLabel(activity.activity_type)}
                              </Badge>
                              {activity.is_completed && (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                  Completed
                                </Badge>
                              )}
                              {activity.priority === 'urgent' && (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {getAccountName(activity.account_id)}
                            </p>
                            {activity.scheduled_at && (
                              <p className="text-xs text-gray-400 mt-1">
                                Scheduled: {formatDateTimeDisplay(activity.scheduled_at, userTimezone)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {getRelativeTime(activity.created_at)}
                            </span>
                            {(canEdit || canDelete) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {canEdit && (
                                    <DropdownMenuItem onClick={() => handleEditClick(activity)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit Activity
                                    </DropdownMenuItem>
                                  )}
                                  {canDelete && (
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteClick(activity)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Activity
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                        
                        {activity.summary && (
                          <p className="text-gray-600 mt-3">{activity.summary}</p>
                        )}
                        
                        {activity.outcome && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Outcome</p>
                            <p className="text-sm text-gray-600 mt-1">{activity.outcome}</p>
                          </div>
                        )}
                        
                        {activity.next_steps && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-700">Next Steps</p>
                            <p className="text-sm text-blue-600 mt-1">{activity.next_steps}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <img
                              src={users.find(u => u.id === activity.owner_id)?.avatar_url}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm text-gray-600">
                              {getUserName(activity.owner_id)}
                            </span>
                          </div>
                          {activity.duration_minutes && (
                            <>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {activity.duration_minutes} min
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {activities.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto" />
              <p className="text-gray-500 mt-4 text-lg">No activities found</p>
              <p className="text-gray-400 mt-1">
                {isAdmin 
                  ? 'Try adjusting your filters or log a new activity'
                  : 'You have no activities yet. Log your first activity!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Activity Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log New Activity</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLogActivitySubmit} className="space-y-4 mt-4">
            <div>
              <Label>Account *</Label>
              <Select 
                value={activityForm.account_id} 
                onValueChange={(value) => setActivityForm({...activityForm, account_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Activity Type *</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {activityTypes.slice(0, 4).map((type) => {
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
            
            <SimpleDateTimeInput
              label="Scheduled Date/Time"
              value={activityForm.scheduled_at}
              onChange={(value) => setActivityForm({...activityForm, scheduled_at: value})}
            />
            
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
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div>
              <Label>Title *</Label>
              <Input 
                placeholder="Activity title" 
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>Summary</Label>
              <Textarea 
                placeholder="Brief summary of the activity" 
                value={editForm.summary}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm({...editForm, summary: e.target.value})}
              />
            </div>
            
            <SimpleDateTimeInput
              label="Scheduled Date/Time"
              value={editForm.scheduled_at}
              onChange={(value) => setEditForm({...editForm, scheduled_at: value})}
            />
            
            <div>
              <Label>Outcome</Label>
              <Textarea 
                placeholder="What was the outcome of this activity?" 
                value={editForm.outcome}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm({...editForm, outcome: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Next Steps</Label>
              <Textarea 
                placeholder="What are the next steps?" 
                value={editForm.next_steps}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm({...editForm, next_steps: e.target.value})}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={editForm.is_completed}
                onCheckedChange={(checked) => setEditForm({...editForm, is_completed: checked as boolean})}
              />
              <Label className="mb-0">Mark as completed</Label>
            </div>
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Activity
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">{selectedActivity.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                {getAccountName(selectedActivity.account_id)}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Modal */}
      <Dialog open={showBulkEditModal} onOpenChange={setShowBulkEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Bulk Edit {selectedActivities.size} Activities
            </DialogTitle>
            <DialogDescription>
              Select the fields you want to update for all selected activities.
              Only changed fields will be applied.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <SimpleDateTimeInput
              label="Scheduled Date/Time (optional)"
              value={bulkEditForm.scheduled_at}
              onChange={(value) => setBulkEditForm({...bulkEditForm, scheduled_at: value})}
            />
            
            <div>
              <Label>Summary (optional)</Label>
              <Textarea 
                placeholder="Update summary for all selected activities"
                value={bulkEditForm.summary}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBulkEditForm({...bulkEditForm, summary: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Status (optional)</Label>
              <Select 
                value={bulkEditForm.is_completed === undefined ? '' : bulkEditForm.is_completed.toString()} 
                onValueChange={(value) => {
                  if (value === '') {
                    setBulkEditForm({...bulkEditForm, is_completed: undefined});
                  } else {
                    setBulkEditForm({...bulkEditForm, is_completed: value === 'true'});
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No change</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                  <SelectItem value="false">Not Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBulkEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEditSubmit} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Update {selectedActivities.size} Activities
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
