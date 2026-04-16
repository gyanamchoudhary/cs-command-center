import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { accounts as initialAccounts } from '@/data/sampleData';
import type { Account, User, AccountStatus, HealthStatus, AccountSegment, ChurnRisk } from '@/types';
import { useAuditLog } from './useAuditLog';
import { toast } from 'sonner';

interface BulkEditResult {
  success: string[];
  failed: { id: string; error: string }[];
}

interface AccountsContextType {
  accounts: Account[];
  
  // CRUD Operations
  addAccount: (account: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>, user: User | null) => { success: boolean; error?: string; account?: Account };
  editAccount: (accountId: string, updates: Partial<Account>, user: User | null) => { success: boolean; error?: string };
  deleteAccount: (accountId: string, user: User | null, isAdmin: boolean) => { success: boolean; error?: string };
  softDeleteAccount: (accountId: string, user: User | null, isAdmin: boolean) => { success: boolean; error?: string };
  restoreAccount: (accountId: string, user: User | null, isAdmin: boolean) => { success: boolean; error?: string };
  
  // Bulk Operations
  bulkEditAccounts: (accountIds: string[], updates: Partial<Account>, user: User | null, isAdmin: boolean) => BulkEditResult;
  bulkDeleteAccounts: (accountIds: string[], user: User | null, isAdmin: boolean) => BulkEditResult;
  bulkSoftDeleteAccounts: (accountIds: string[], user: User | null, isAdmin: boolean) => BulkEditResult;
  
  // Getters with permissions
  getAccountById: (accountId: string) => Account | undefined;
  getVisibleAccounts: (userId: string, isAdmin: boolean) => Account[];
  getAccountsByOwner: (ownerId: string) => Account[];
  getDeletedAccounts: (isAdmin: boolean) => Account[];
  
  // Filters
  filterAccounts: (filters: AccountFilters, userId: string, isAdmin: boolean) => Account[];
  
  // Search
  searchAccounts: (query: string, userId: string, isAdmin: boolean) => Account[];
  
  // Stats
  getAccountStats: (userId: string, isAdmin: boolean) => AccountStats;
}

interface AccountFilters {
  region?: string;
  status?: AccountStatus;
  health_status?: HealthStatus;
  segment?: AccountSegment;
  owner_id?: string;
  churn_risk?: ChurnRisk;
}

interface AccountStats {
  total: number;
  active: number;
  atRisk: number;
  churned: number;
  totalARR: number;
  totalMRR: number;
}

const AccountsContext = createContext<AccountsContextType | null>(null);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const { logAction, logBulkAction } = useAuditLog();

  // Get account by ID
  const getAccountById = useCallback((accountId: string) => {
    return accounts.find(a => a.id === accountId && !a.is_deleted);
  }, [accounts]);

  // Get visible accounts (respecting permissions)
  const getVisibleAccounts = useCallback((userId: string, isAdmin: boolean) => {
    let filtered = accounts.filter(a => !a.is_deleted);
    
    if (!isAdmin) {
      // Users can only see accounts assigned to them
      filtered = filtered.filter(a => 
        a.primary_csm_id === userId || a.secondary_csm_id === userId
      );
    }
    
    return filtered.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [accounts]);

  // Get accounts by owner
  const getAccountsByOwner = useCallback((ownerId: string) => {
    return accounts.filter(a => 
      !a.is_deleted && 
      (a.primary_csm_id === ownerId || a.secondary_csm_id === ownerId)
    );
  }, [accounts]);

  // Get deleted accounts (admin only)
  const getDeletedAccounts = useCallback((isAdmin: boolean) => {
    if (!isAdmin) return [];
    return accounts.filter(a => a.is_deleted);
  }, [accounts]);

  // Add new account (admin only)
  const addAccount = useCallback((accountData: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>, user: User | null) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to create accounts' };
    }

    if (user.role !== 'admin') {
      const error = 'Only administrators can create accounts';
      logAction({
        action: 'create',
        entityType: 'account',
        entityId: 'new',
        user,
        details: 'Non-admin attempted to create account',
        success: false,
        errorMessage: error,
      });
      return { success: false, error };
    }

    const now = new Date().toISOString();
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
      is_deleted: false,
      created_at: now,
      updated_at: now,
    };
    
    setAccounts(prev => [newAccount, ...prev]);
    
    logAction({
      action: 'create',
      entityType: 'account',
      entityId: newAccount.id,
      user,
      details: `Created account: "${newAccount.name}"`,
      newValues: newAccount,
      success: true,
    });
    
    toast.success(`Account "${newAccount.name}" created successfully`);
    return { success: true, account: newAccount };
  }, [logAction]);

  // Edit account (admin only)
  const editAccount = useCallback((accountId: string, updates: Partial<Account>, user: User | null) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to edit accounts' };
    }

    if (user.role !== 'admin') {
      const error = 'Only administrators can edit accounts';
      logAction({
        action: 'edit',
        entityType: 'account',
        entityId: accountId,
        user,
        details: 'Non-admin attempted to edit account',
        success: false,
        errorMessage: error,
      });
      return { success: false, error };
    }

    const account = accounts.find(a => a.id === accountId && !a.is_deleted);
    
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    const oldValues = { ...account };
    const updatedAccount = { ...account, ...updates, updated_at: new Date().toISOString() };

    setAccounts(prev => prev.map(a => 
      a.id === accountId ? updatedAccount : a
    ));

    logAction({
      action: 'edit',
      entityType: 'account',
      entityId: accountId,
      user,
      details: `Edited account: "${account.name}"`,
      oldValues,
      newValues: updates,
      success: true,
    });

    toast.success('Account updated successfully');
    return { success: true };
  }, [accounts, logAction]);

  // Hard delete account (admin only - permanent)
  const deleteAccount = useCallback((accountId: string, user: User | null, isAdmin: boolean) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to delete accounts' };
    }

    if (!isAdmin) {
      const error = 'Only administrators can delete accounts';
      logAction({
        action: 'delete',
        entityType: 'account',
        entityId: accountId,
        user,
        details: 'Non-admin attempted to delete account',
        success: false,
        errorMessage: error,
      });
      return { success: false, error };
    }

    const account = accounts.find(a => a.id === accountId);
    
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    setAccounts(prev => prev.filter(a => a.id !== accountId));

    logAction({
      action: 'delete',
      entityType: 'account',
      entityId: accountId,
      user,
      details: `Permanently deleted account: "${account.name}"`,
      oldValues: account,
      success: true,
    });

    toast.success('Account permanently deleted');
    return { success: true };
  }, [accounts, logAction]);

  // Soft delete account (admin only - recoverable)
  const softDeleteAccount = useCallback((accountId: string, user: User | null, isAdmin: boolean) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to delete accounts' };
    }

    if (!isAdmin) {
      const error = 'Only administrators can delete accounts';
      logAction({
        action: 'delete',
        entityType: 'account',
        entityId: accountId,
        user,
        details: 'Non-admin attempted to delete account',
        success: false,
        errorMessage: error,
      });
      return { success: false, error };
    }

    const account = accounts.find(a => a.id === accountId && !a.is_deleted);
    
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    const now = new Date().toISOString();
    
    setAccounts(prev => prev.map(a => 
      a.id === accountId 
        ? { ...a, is_deleted: true, deleted_at: now, deleted_by: user.id, updated_at: now }
        : a
    ));

    logAction({
      action: 'delete',
      entityType: 'account',
      entityId: accountId,
      user,
      details: `Soft deleted account: "${account.name}"`,
      oldValues: account,
      success: true,
    });

    toast.success('Account moved to trash');
    return { success: true };
  }, [accounts, logAction]);

  // Restore soft-deleted account (admin only)
  const restoreAccount = useCallback((accountId: string, user: User | null, isAdmin: boolean) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to restore accounts' };
    }

    if (!isAdmin) {
      const error = 'Only administrators can restore accounts';
      logAction({
        action: 'restore',
        entityType: 'account',
        entityId: accountId,
        user,
        details: 'Non-admin attempted to restore account',
        success: false,
        errorMessage: error,
      });
      return { success: false, error };
    }

    const account = accounts.find(a => a.id === accountId && a.is_deleted);
    
    if (!account) {
      return { success: false, error: 'Deleted account not found' };
    }

    setAccounts(prev => prev.map(a => 
      a.id === accountId 
        ? { ...a, is_deleted: false, deleted_at: undefined, deleted_by: undefined, updated_at: new Date().toISOString() }
        : a
    ));

    logAction({
      action: 'restore',
      entityType: 'account',
      entityId: accountId,
      user,
      details: `Restored account: "${account.name}"`,
      success: true,
    });

    toast.success('Account restored successfully');
    return { success: true };
  }, [accounts, logAction]);

  // Bulk edit accounts (admin only)
  const bulkEditAccounts = useCallback((accountIds: string[], updates: Partial<Account>, user: User | null, isAdmin: boolean): BulkEditResult => {
    if (!user) {
      toast.error('You must be logged in to perform bulk edits');
      return { success: [], failed: accountIds.map(id => ({ id, error: 'Not logged in' })) };
    }

    if (!isAdmin) {
      toast.error('Only administrators can perform bulk edits');
      return { success: [], failed: accountIds.map(id => ({ id, error: 'Not authorized' })) };
    }

    const result: BulkEditResult = { success: [], failed: [] };
    const now = new Date().toISOString();

    accountIds.forEach(accountId => {
      const account = accounts.find(a => a.id === accountId && !a.is_deleted);
      
      if (!account) {
        result.failed.push({ id: accountId, error: 'Account not found' });
        return;
      }

      setAccounts(prev => prev.map(a => 
        a.id === accountId 
          ? { ...a, ...updates, updated_at: now }
          : a
      ));

      result.success.push(accountId);
    });

    logBulkAction({
      action: 'bulk_edit',
      entityType: 'account',
      entityIds: accountIds,
      user,
      details: `Bulk edited ${result.success.length} accounts`,
      changes: updates,
      successCount: result.success.length,
      failureCount: result.failed.length,
      errors: result.failed.map(f => `${f.id}: ${f.error}`),
    });

    if (result.success.length > 0) {
      toast.success(`Successfully updated ${result.success.length} accounts`);
    }
    if (result.failed.length > 0) {
      toast.error(`Failed to update ${result.failed.length} accounts`);
    }

    return result;
  }, [accounts, logBulkAction]);

  // Bulk hard delete accounts (admin only)
  const bulkDeleteAccounts = useCallback((accountIds: string[], user: User | null, isAdmin: boolean): BulkEditResult => {
    if (!user) {
      toast.error('You must be logged in to delete accounts');
      return { success: [], failed: accountIds.map(id => ({ id, error: 'Not logged in' })) };
    }

    if (!isAdmin) {
      toast.error('Only administrators can delete accounts');
      return { success: [], failed: accountIds.map(id => ({ id, error: 'Not authorized' })) };
    }

    const result: BulkEditResult = { success: [], failed: [] };

    accountIds.forEach(accountId => {
      const account = accounts.find(a => a.id === accountId);
      
      if (!account) {
        result.failed.push({ id: accountId, error: 'Account not found' });
        return;
      }

      setAccounts(prev => prev.filter(a => a.id !== accountId));
      result.success.push(accountId);
    });

    logBulkAction({
      action: 'bulk_delete',
      entityType: 'account',
      entityIds: accountIds,
      user,
      details: `Permanently deleted ${result.success.length} accounts`,
      successCount: result.success.length,
      failureCount: result.failed.length,
      errors: result.failed.map(f => `${f.id}: ${f.error}`),
    });

    if (result.success.length > 0) {
      toast.success(`Successfully deleted ${result.success.length} accounts`);
    }
    if (result.failed.length > 0) {
      toast.error(`Failed to delete ${result.failed.length} accounts`);
    }

    return result;
  }, [accounts, logBulkAction]);

  // Bulk soft delete accounts (admin only)
  const bulkSoftDeleteAccounts = useCallback((accountIds: string[], user: User | null, isAdmin: boolean): BulkEditResult => {
    if (!user) {
      toast.error('You must be logged in to delete accounts');
      return { success: [], failed: accountIds.map(id => ({ id, error: 'Not logged in' })) };
    }

    if (!isAdmin) {
      toast.error('Only administrators can delete accounts');
      return { success: [], failed: accountIds.map(id => ({ id, error: 'Not authorized' })) };
    }

    const result: BulkEditResult = { success: [], failed: [] };
    const now = new Date().toISOString();

    accountIds.forEach(accountId => {
      const account = accounts.find(a => a.id === accountId && !a.is_deleted);
      
      if (!account) {
        result.failed.push({ id: accountId, error: 'Account not found' });
        return;
      }

      setAccounts(prev => prev.map(a => 
        a.id === accountId 
          ? { ...a, is_deleted: true, deleted_at: now, deleted_by: user.id, updated_at: now }
          : a
      ));

      result.success.push(accountId);
    });

    logBulkAction({
      action: 'bulk_delete',
      entityType: 'account',
      entityIds: accountIds,
      user,
      details: `Soft deleted ${result.success.length} accounts`,
      successCount: result.success.length,
      failureCount: result.failed.length,
      errors: result.failed.map(f => `${f.id}: ${f.error}`),
    });

    if (result.success.length > 0) {
      toast.success(`Successfully moved ${result.success.length} accounts to trash`);
    }
    if (result.failed.length > 0) {
      toast.error(`Failed to delete ${result.failed.length} accounts`);
    }

    return result;
  }, [accounts, logBulkAction]);

  // Filter accounts with permissions
  const filterAccounts = useCallback((filters: AccountFilters, userId: string, isAdmin: boolean) => {
    let filtered = getVisibleAccounts(userId, isAdmin);

    if (filters.region) {
      filtered = filtered.filter(a => a.region === filters.region);
    }
    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    if (filters.health_status) {
      filtered = filtered.filter(a => a.health_status === filters.health_status);
    }
    if (filters.segment) {
      filtered = filtered.filter(a => a.segment === filters.segment);
    }
    if (filters.owner_id) {
      filtered = filtered.filter(a => a.primary_csm_id === filters.owner_id || a.secondary_csm_id === filters.owner_id);
    }
    if (filters.churn_risk) {
      filtered = filtered.filter(a => a.churn_risk === filters.churn_risk);
    }

    return filtered;
  }, [getVisibleAccounts]);

  // Search accounts with permissions
  const searchAccounts = useCallback((query: string, userId: string, isAdmin: boolean) => {
    const visible = getVisibleAccounts(userId, isAdmin);
    const lowerQuery = query.toLowerCase();
    
    return visible.filter(a => 
      a.name.toLowerCase().includes(lowerQuery) ||
      a.domain?.toLowerCase().includes(lowerQuery) ||
      a.industry?.toLowerCase().includes(lowerQuery) ||
      a.region.toLowerCase().includes(lowerQuery)
    );
  }, [getVisibleAccounts]);

  // Get account stats
  const getAccountStats = useCallback((userId: string, isAdmin: boolean): AccountStats => {
    const visible = getVisibleAccounts(userId, isAdmin);
    
    return {
      total: visible.length,
      active: visible.filter(a => a.status === 'active').length,
      atRisk: visible.filter(a => a.churn_risk === 'high' || a.churn_risk === 'critical').length,
      churned: visible.filter(a => a.status === 'churned').length,
      totalARR: visible.reduce((sum, a) => sum + a.arr, 0),
      totalMRR: visible.reduce((sum, a) => sum + a.mrr, 0),
    };
  }, [getVisibleAccounts]);

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        addAccount,
        editAccount,
        deleteAccount,
        softDeleteAccount,
        restoreAccount,
        bulkEditAccounts,
        bulkDeleteAccounts,
        bulkSoftDeleteAccounts,
        getAccountById,
        getVisibleAccounts,
        getAccountsByOwner,
        getDeletedAccounts,
        filterAccounts,
        searchAccounts,
        getAccountStats,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
}
