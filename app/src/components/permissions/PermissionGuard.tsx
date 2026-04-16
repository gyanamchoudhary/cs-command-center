import { usePermissions, type PermissionCheck } from '@/hooks/usePermissions';
import type { Account, Activity } from '@/types';

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  check: (permissions: ReturnType<typeof usePermissions>) => PermissionCheck;
}

// Generic permission guard that accepts a custom check function
export function PermissionGuard({ children, fallback = null, check }: PermissionGuardProps) {
  const permissions = usePermissions();
  const result = check(permissions);
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// Admin-only guard
interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin } = usePermissions();
  
  if (isAdmin) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// User-only guard (non-admin)
interface UserOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function UserOnly({ children, fallback = null }: UserOnlyProps) {
  const { isUser } = usePermissions();
  
  if (isUser) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// Account permission guards
interface CanViewAccountProps {
  account: Account;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanViewAccount({ account, children, fallback = null }: CanViewAccountProps) {
  const { canViewAccount } = usePermissions();
  const result = canViewAccount(account);
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface CanEditAccountProps {
  account: Account;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanEditAccount({ account, children, fallback = null }: CanEditAccountProps) {
  const { canEditAccount } = usePermissions();
  const result = canEditAccount(account);
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface CanDeleteAccountProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanDeleteAccount({ children, fallback = null }: CanDeleteAccountProps) {
  const { canDeleteAccount } = usePermissions();
  const result = canDeleteAccount();
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// Activity permission guards
interface CanViewActivityProps {
  activity: Activity;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanViewActivity({ activity, children, fallback = null }: CanViewActivityProps) {
  const { canViewActivity } = usePermissions();
  const result = canViewActivity(activity);
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface CanEditActivityProps {
  activity: Activity;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanEditActivity({ activity, children, fallback = null }: CanEditActivityProps) {
  const { canEditActivity } = usePermissions();
  const result = canEditActivity(activity);
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface CanDeleteActivityProps {
  activity: Activity;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanDeleteActivity({ activity, children, fallback = null }: CanDeleteActivityProps) {
  const { canDeleteActivity } = usePermissions();
  const result = canDeleteActivity(activity);
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// Bulk action permission guards
interface CanBulkEditAccountsProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanBulkEditAccounts({ children, fallback = null }: CanBulkEditAccountsProps) {
  const { canBulkEditAccounts } = usePermissions();
  const result = canBulkEditAccounts();
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface CanBulkDeleteAccountsProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanBulkDeleteAccounts({ children, fallback = null }: CanBulkDeleteAccountsProps) {
  const { canBulkDeleteAccounts } = usePermissions();
  const result = canBulkDeleteAccounts();
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface CanBulkEditActivitiesProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanBulkEditActivities({ children, fallback = null }: CanBulkEditActivitiesProps) {
  const { canBulkEditActivities } = usePermissions();
  const result = canBulkEditActivities();
  
  if (result.allowed) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// Disabled button wrapper that shows tooltip
interface PermissionButtonProps {
  children: React.ReactNode;
  check: () => PermissionCheck;
  tooltipClassName?: string;
}

export function PermissionButton({ children, check, tooltipClassName = '' }: PermissionButtonProps) {
  const result = check();
  
  if (!result.allowed) {
    return (
      <div className={`relative group ${tooltipClassName}`}>
        <div className="opacity-50 cursor-not-allowed pointer-events-none">
          {children}
        </div>
        {result.reason && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {result.reason}
          </div>
        )}
      </div>
    );
  }
  
  return <>{children}</>;
}
