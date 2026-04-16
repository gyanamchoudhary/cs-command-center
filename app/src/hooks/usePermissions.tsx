import { useCallback } from 'react';
import { useAuth } from './useAuth';
import type { User, Account, Activity, UserRole } from '@/types';

// Permission check result
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  requiredRole?: UserRole;
}

// RBAC Permissions Interface
export interface RBACPermissions {
  // Account permissions
  canViewAccount: (account: Account) => PermissionCheck;
  canCreateAccount: () => PermissionCheck;
  canEditAccount: (account: Account) => PermissionCheck;
  canDeleteAccount: () => PermissionCheck;
  canBulkEditAccounts: () => PermissionCheck;
  canBulkDeleteAccounts: () => PermissionCheck;
  canRestoreAccount: () => PermissionCheck;
  
  // Activity permissions
  canViewActivity: (activity: Activity) => PermissionCheck;
  canCreateActivity: () => PermissionCheck;
  canEditActivity: (activity: Activity) => PermissionCheck;
  canDeleteActivity: (activity: Activity) => PermissionCheck;
  canBulkEditActivities: () => PermissionCheck;
  
  // General permissions
  isAdmin: boolean;
  isUser: boolean;
  currentUser: User | null;
  
  // Permission helpers
  requireAdmin: (action: string) => PermissionCheck;
  requireOwnership: (ownerId: string, action: string) => PermissionCheck;
}

export function usePermissions(): RBACPermissions {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  // Helper: Require admin role
  const requireAdmin = useCallback((action: string): PermissionCheck => {
    if (isAdmin) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Only administrators can ${action}`,
      requiredRole: 'admin',
    };
  }, [isAdmin]);

  // Helper: Require ownership
  const requireOwnership = useCallback((ownerId: string, action: string): PermissionCheck => {
    if (!user) {
      return {
        allowed: false,
        reason: 'You must be logged in to perform this action',
      };
    }
    
    if (isAdmin) {
      return { allowed: true };
    }
    
    if (user.id === ownerId) {
      return { allowed: true };
    }
    
    return {
      allowed: false,
      reason: `You can only ${action} your own items`,
    };
  }, [user, isAdmin]);

  // Account Permissions
  const canViewAccount = useCallback((account: Account): PermissionCheck => {
    if (isAdmin) {
      return { allowed: true };
    }
    
    // Users can only view accounts assigned to them
    if (account.primary_csm_id === user?.id || account.secondary_csm_id === user?.id) {
      return { allowed: true };
    }
    
    return {
      allowed: false,
      reason: 'You can only view accounts assigned to you',
    };
  }, [isAdmin, user]);

  const canCreateAccount = useCallback((): PermissionCheck => {
    return requireAdmin('create accounts');
  }, [requireAdmin]);

  const canEditAccount = useCallback((_account: Account): PermissionCheck => {
    // Only admin can edit accounts
    return requireAdmin('edit accounts');
  }, [requireAdmin]);

  const canDeleteAccount = useCallback((): PermissionCheck => {
    return requireAdmin('delete accounts');
  }, [requireAdmin]);

  const canBulkEditAccounts = useCallback((): PermissionCheck => {
    return requireAdmin('perform bulk edits on accounts');
  }, [requireAdmin]);

  const canBulkDeleteAccounts = useCallback((): PermissionCheck => {
    return requireAdmin('perform bulk deletes on accounts');
  }, [requireAdmin]);

  const canRestoreAccount = useCallback((): PermissionCheck => {
    return requireAdmin('restore deleted accounts');
  }, [requireAdmin]);

  // Activity Permissions
  const canViewActivity = useCallback((activity: Activity): PermissionCheck => {
    if (isAdmin) {
      return { allowed: true };
    }
    
    // Users can only view their own activities
    if (activity.owner_id === user?.id) {
      return { allowed: true };
    }
    
    return {
      allowed: false,
      reason: 'You can only view your own activities',
    };
  }, [isAdmin, user]);

  const canCreateActivity = useCallback((): PermissionCheck => {
    if (!user) {
      return {
        allowed: false,
        reason: 'You must be logged in to create activities',
      };
    }
    return { allowed: true };
  }, [user]);

  const canEditActivity = useCallback((activity: Activity): PermissionCheck => {
    if (!user) {
      return {
        allowed: false,
        reason: 'You must be logged in to edit activities',
      };
    }
    
    // Admin cannot edit activities (only delete)
    if (isAdmin) {
      return {
        allowed: false,
        reason: 'Administrators cannot edit activities. Only the activity owner can edit their own activities.',
      };
    }
    
    // Users can only edit their own activities
    if (activity.owner_id === user.id) {
      return { allowed: true };
    }
    
    return {
      allowed: false,
      reason: 'You can only edit your own activities',
    };
  }, [user, isAdmin]);

  const canDeleteActivity = useCallback((activity: Activity): PermissionCheck => {
    if (!user) {
      return {
        allowed: false,
        reason: 'You must be logged in to delete activities',
      };
    }
    
    // Admin can delete any activity
    if (isAdmin) {
      return { allowed: true };
    }
    
    // Users can only delete their own activities
    if (activity.owner_id === user.id) {
      return { allowed: true };
    }
    
    return {
      allowed: false,
      reason: 'You can only delete your own activities',
    };
  }, [user, isAdmin]);

  const canBulkEditActivities = useCallback((): PermissionCheck => {
    if (!user) {
      return {
        allowed: false,
        reason: 'You must be logged in to perform bulk edits',
      };
    }
    
    // Admin cannot bulk edit activities
    if (isAdmin) {
      return {
        allowed: false,
        reason: 'Administrators cannot bulk edit activities',
      };
    }
    
    // Users can bulk edit their own activities
    return { allowed: true };
  }, [user, isAdmin]);

  return {
    // Account permissions
    canViewAccount,
    canCreateAccount,
    canEditAccount,
    canDeleteAccount,
    canBulkEditAccounts,
    canBulkDeleteAccounts,
    canRestoreAccount,
    
    // Activity permissions
    canViewActivity,
    canCreateActivity,
    canEditActivity,
    canDeleteActivity,
    canBulkEditActivities,
    
    // General
    isAdmin,
    isUser,
    currentUser: user,
    
    // Helpers
    requireAdmin,
    requireOwnership,
  };
}

// Hook for checking if user has permission (returns boolean only)
export function useHasPermission() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const hasPermission = useCallback((permission: string): boolean => {
    switch (permission) {
      case 'account:create':
      case 'account:delete':
      case 'account:bulk_edit':
      case 'account:bulk_delete':
      case 'account:restore':
        return isAdmin;
      case 'activity:create':
        return !!user;
      case 'activity:bulk_edit':
        return !!user && !isAdmin; // Only non-admin users can bulk edit their own
      default:
        return false;
    }
  }, [isAdmin, user]);

  return { hasPermission, isAdmin, user };
}

// Permission-aware wrapper component helper
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  permissionCheck: (permissions: RBACPermissions) => boolean,
  FallbackComponent?: React.ComponentType
) {
  return function PermissionWrapper(props: T) {
    const permissions = usePermissions();
    
    if (permissionCheck(permissions)) {
      return <Component {...props} />;
    }
    
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    return null;
  };
}
