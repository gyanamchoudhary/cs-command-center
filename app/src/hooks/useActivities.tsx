import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { activities as initialActivities } from '@/data/sampleData';
import type { Activity, User } from '@/types';
import { useAuditLog } from './useAuditLog';
import { toast } from 'sonner';

interface BulkEditResult {
  success: string[];
  failed: { id: string; error: string }[];
}

interface ActivitiesContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>, user: User | null) => { success: boolean; error?: string; activity?: Activity };
  editActivity: (activityId: string, updates: Partial<Activity>, user: User | null, isAdmin: boolean) => { success: boolean; error?: string };
  deleteActivity: (activityId: string, user: User | null, isAdmin: boolean) => { success: boolean; error?: string };
  bulkEditActivities: (activityIds: string[], updates: Partial<Activity>, user: User | null, isAdmin: boolean) => BulkEditResult;
  getActivitiesByAccount: (accountId: string, userId: string, isAdmin: boolean) => Activity[];
  getUserActivities: (userId: string, isAdmin: boolean) => Activity[];
  canEditActivity: (activityId: string, userId: string, isAdmin: boolean) => boolean;
  canDeleteActivity: (activityId: string, userId: string, isAdmin: boolean) => boolean;
  getActivityById: (activityId: string) => Activity | undefined;
}

const ActivitiesContext = createContext<ActivitiesContextType | null>(null);

// Get user's timezone offset in minutes
function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
  } catch {
    return 0;
  }
}

// Convert local datetime to UTC
export function toUTC(localDateTime: string, timezone: string): string {
  if (!localDateTime) return '';
  const date = new Date(localDateTime);
  const offset = getTimezoneOffset(timezone);
  const utcDate = new Date(date.getTime() - offset * 60 * 1000);
  return utcDate.toISOString();
}

// Convert UTC to local datetime for display
export function fromUTC(utcDateTime: string, timezone: string): string {
  if (!utcDateTime) return '';
  const date = new Date(utcDateTime);
  const offset = getTimezoneOffset(timezone);
  const localDate = new Date(date.getTime() + offset * 60 * 1000);
  return localDate.toISOString();
}

// Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
export function formatForDateTimeInput(dateString: string, timezone: string): string {
  if (!dateString) return '';
  const localDate = fromUTC(dateString, timezone);
  const date = new Date(localDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Format datetime for display (dd/mm/yyyy hh:mm)
export function formatDateTimeDisplay(dateString: string, timezone: string): string {
  if (!dateString) return '';
  const localDate = fromUTC(dateString, timezone);
  const date = new Date(localDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const { logAction, logBulkAction } = useAuditLog();

  // Check if user can edit an activity
  const canEditActivity = useCallback((activityId: string, userId: string, isAdmin: boolean): boolean => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return false;
    
    // Admin cannot edit activities
    if (isAdmin) return false;
    
    // Users can only edit their own activities
    return activity.owner_id === userId;
  }, [activities]);

  // Check if user can delete an activity
  const canDeleteActivity = useCallback((activityId: string, userId: string, isAdmin: boolean): boolean => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return false;
    
    // Admin can delete any activity
    if (isAdmin) return true;
    
    // Users can only delete their own activities
    return activity.owner_id === userId;
  }, [activities]);

  // Get activity by ID
  const getActivityById = useCallback((activityId: string) => {
    return activities.find(a => a.id === activityId);
  }, [activities]);

  // Add new activity
  const addActivity = useCallback((activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>, user: User | null) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to create activities' };
    }

    const now = new Date().toISOString();
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
      timezone: user.timezone,
      utc_offset: getTimezoneOffset(user.timezone),
      created_at: now,
      updated_at: now,
    };
    
    setActivities(prev => [newActivity, ...prev]);
    
    logAction({
      action: 'create',
      entityType: 'activity',
      entityId: newActivity.id,
      user,
      details: `Created activity: "${newActivity.title}"`,
      newValues: newActivity,
      success: true,
    });
    
    toast.success(`Activity "${newActivity.title}" created successfully`);
    return { success: true, activity: newActivity };
  }, [logAction]);

  // Edit activity (users can only edit their own)
  const editActivity = useCallback((activityId: string, updates: Partial<Activity>, user: User | null, isAdmin: boolean) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to edit activities' };
    }

    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) {
      logAction({
        action: 'edit',
        entityType: 'activity',
        entityId: activityId,
        user,
        details: `Attempted to edit non-existent activity`,
        success: false,
        errorMessage: 'Activity not found',
      });
      return { success: false, error: 'Activity not found' };
    }

    // Admin cannot edit activities
    if (isAdmin) {
      const error = 'Admin users cannot edit activities. Only the activity owner can edit their own activities.';
      logAction({
        action: 'edit',
        entityType: 'activity',
        entityId: activityId,
        user,
        details: `Admin attempted to edit activity "${activity.title}"`,
        oldValues: activity,
        success: false,
        errorMessage: error,
      });
      return { success: false, error };
    }

    // Users can only edit their own activities
    if (activity.owner_id !== user.id) {
      const error = 'You can only edit your own activities';
      logAction({
        action: 'edit',
        entityType: 'activity',
        entityId: activityId,
        user,
        details: `User attempted to edit activity "${activity.title}" owned by ${activity.owner_id}`,
        oldValues: activity,
        success: false,
        errorMessage: error,
      });
      return { success: false, error };
    }

    const oldValues = { ...activity };
    const updatedActivity = { ...activity, ...updates, updated_at: new Date().toISOString() };

    setActivities(prev => prev.map(a => 
      a.id === activityId ? updatedActivity : a
    ));

    logAction({
      action: 'edit',
      entityType: 'activity',
      entityId: activityId,
      user,
      details: `Edited activity: "${activity.title}"`,
      oldValues,
      newValues: updates,
      success: true,
    });

    toast.success('Activity updated successfully');
    return { success: true };
  }, [activities, logAction]);

  // Bulk edit activities (users can only edit their own)
  const bulkEditActivities = useCallback((activityIds: string[], updates: Partial<Activity>, user: User | null, isAdmin: boolean): BulkEditResult => {
    if (!user) {
      toast.error('You must be logged in to perform bulk edits');
      return { success: [], failed: activityIds.map(id => ({ id, error: 'Not logged in' })) };
    }

    // Admin cannot bulk edit activities
    if (isAdmin) {
      toast.error('Administrators cannot bulk edit activities');
      return { success: [], failed: activityIds.map(id => ({ id, error: 'Admin cannot bulk edit' })) };
    }

    const result: BulkEditResult = { success: [], failed: [] };
    const now = new Date().toISOString();

    activityIds.forEach(activityId => {
      const activity = activities.find(a => a.id === activityId);
      
      if (!activity) {
        result.failed.push({ id: activityId, error: 'Activity not found' });
        return;
      }

      if (activity.owner_id !== user.id) {
        result.failed.push({ id: activityId, error: 'You can only edit your own activities' });
        return;
      }

      setActivities(prev => prev.map(a => 
        a.id === activityId 
          ? { ...a, ...updates, updated_at: now }
          : a
      ));

      result.success.push(activityId);
    });

    // Log bulk action
    logBulkAction({
      action: 'bulk_edit',
      entityType: 'activity',
      entityIds: activityIds,
      user,
      details: `Bulk edited ${result.success.length} activities`,
      changes: updates,
      successCount: result.success.length,
      failureCount: result.failed.length,
      errors: result.failed.map(f => `${f.id}: ${f.error}`),
    });

    if (result.success.length > 0) {
      toast.success(`Successfully updated ${result.success.length} activities`);
    }
    if (result.failed.length > 0) {
      toast.error(`Failed to update ${result.failed.length} activities`);
    }

    return result;
  }, [activities, logBulkAction]);

  // Delete activity (admin can delete any, users can delete their own)
  const deleteActivity = useCallback((activityId: string, user: User | null, isAdmin: boolean) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to delete activities' };
    }

    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) {
      logAction({
        action: 'delete',
        entityType: 'activity',
        entityId: activityId,
        user,
        details: `Attempted to delete non-existent activity`,
        success: false,
        errorMessage: 'Activity not found',
      });
      return { success: false, error: 'Activity not found' };
    }

    // Check permissions
    if (!isAdmin && activity.owner_id !== user.id) {
      const error = 'You can only delete your own activities';
      logAction({
        action: 'delete',
        entityType: 'activity',
        entityId: activityId,
        user,
        details: `User attempted to delete activity "${activity.title}" owned by ${activity.owner_id}`,
        oldValues: activity,
        success: false,
        errorMessage: error,
      });
      return { success: false, error };
    }

    setActivities(prev => prev.filter(a => a.id !== activityId));

    logAction({
      action: 'delete',
      entityType: 'activity',
      entityId: activityId,
      user,
      details: `${isAdmin ? 'Admin' : 'User'} deleted activity: "${activity.title}"`,
      oldValues: activity,
      success: true,
    });

    toast.success('Activity deleted successfully');
    return { success: true };
  }, [activities, logAction]);

  // Get activities for an account (users see only their own, admin sees all)
  const getActivitiesByAccount = useCallback((accountId: string, userId: string, isAdmin: boolean) => {
    let filtered = activities.filter(a => a.account_id === accountId);
    
    // Non-admin users can only see their own activities
    if (!isAdmin) {
      filtered = filtered.filter(a => a.owner_id === userId);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [activities]);

  // Get activities for a user (users see only their own, admin sees all)
  const getUserActivities = useCallback((userId: string, isAdmin: boolean) => {
    let filtered = activities;
    
    // Non-admin users can only see their own activities
    if (!isAdmin) {
      filtered = filtered.filter(a => a.owner_id === userId);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [activities]);

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        addActivity,
        editActivity,
        deleteActivity,
        bulkEditActivities,
        getActivitiesByAccount,
        getUserActivities,
        canEditActivity,
        canDeleteActivity,
        getActivityById,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
}
