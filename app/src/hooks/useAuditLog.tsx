import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuditLog, AuditAction, AuditEntityType, User } from '@/types';

interface AuditLogContextType {
  auditLogs: AuditLog[];
  logAction: (params: LogActionParams) => AuditLog;
  logBulkAction: (params: LogBulkActionParams) => AuditLog;
  getLogsByEntity: (entityType: AuditEntityType, entityId: string) => AuditLog[];
  getLogsByUser: (userId: string) => AuditLog[];
  getLogsByAction: (action: AuditAction) => AuditLog[];
  getRecentLogs: (limit?: number) => AuditLog[];
  clearLogs: () => void;
}

interface LogActionParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  user: User | null;
  details: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface LogBulkActionParams {
  action: 'bulk_edit' | 'bulk_delete';
  entityType: AuditEntityType;
  entityIds: string[];
  user: User | null;
  details: string;
  changes?: Record<string, any>;
  successCount: number;
  failureCount: number;
  errors?: string[];
}

const AuditLogContext = createContext<AuditLogContextType | null>(null);

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Generate unique ID for audit log
  const generateLogId = () => `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Log a single action
  const logAction = useCallback(({
    action,
    entityType,
    entityId,
    user,
    details,
    oldValues,
    newValues,
    success,
    errorMessage,
    ipAddress,
    userAgent,
  }: LogActionParams): AuditLog => {
    const newLog: AuditLog = {
      id: generateLogId(),
      action,
      entity_type: entityType,
      entity_id: entityId,
      user_id: user?.id || 'anonymous',
      user_email: user?.email || 'anonymous',
      user_role: user?.role || 'user',
      timestamp: new Date().toISOString(),
      details,
      old_values: oldValues,
      new_values: newValues,
      success,
      error_message: errorMessage,
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    setAuditLogs(prev => [newLog, ...prev]);
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log('[Audit Log]', newLog);
    }

    return newLog;
  }, []);

  // Log a bulk action
  const logBulkAction = useCallback(({
    action,
    entityType,
    entityIds,
    user,
    details,
    changes,
    successCount,
    failureCount,
    errors,
  }: LogBulkActionParams): AuditLog => {
    const newLog: AuditLog = {
      id: generateLogId(),
      action,
      entity_type: entityType,
      entity_id: `bulk-${entityIds.join(',')}`,
      user_id: user?.id || 'anonymous',
      user_email: user?.email || 'anonymous',
      user_role: user?.role || 'user',
      timestamp: new Date().toISOString(),
      details: `${details} | Affected: ${successCount} succeeded, ${failureCount} failed`,
      new_values: {
        entity_ids: entityIds,
        changes,
        success_count: successCount,
        failure_count: failureCount,
        errors,
      },
      success: failureCount === 0,
      error_message: errors?.join('; '),
    };

    setAuditLogs(prev => [newLog, ...prev]);

    if (import.meta.env.DEV) {
      console.log('[Audit Log - Bulk]', newLog);
    }

    return newLog;
  }, []);

  // Get logs by entity
  const getLogsByEntity = useCallback((entityType: AuditEntityType, entityId: string): AuditLog[] => {
    return auditLogs.filter(
      log => log.entity_type === entityType && log.entity_id === entityId
    );
  }, [auditLogs]);

  // Get logs by user
  const getLogsByUser = useCallback((userId: string): AuditLog[] => {
    return auditLogs.filter(log => log.user_id === userId);
  }, [auditLogs]);

  // Get logs by action type
  const getLogsByAction = useCallback((action: AuditAction): AuditLog[] => {
    return auditLogs.filter(log => log.action === action);
  }, [auditLogs]);

  // Get recent logs
  const getRecentLogs = useCallback((limit: number = 50): AuditLog[] => {
    return auditLogs.slice(0, limit);
  }, [auditLogs]);

  // Clear all logs (admin only)
  const clearLogs = useCallback(() => {
    setAuditLogs([]);
  }, []);

  return (
    <AuditLogContext.Provider
      value={{
        auditLogs,
        logAction,
        logBulkAction,
        getLogsByEntity,
        getLogsByUser,
        getLogsByAction,
        getRecentLogs,
        clearLogs,
      }}
    >
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (!context) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
}

// Helper hook for entity-specific audit tracking
export function useEntityAuditLog(entityType: AuditEntityType, entityId: string) {
  const { getLogsByEntity } = useAuditLog();
  
  const logs = getLogsByEntity(entityType, entityId);
  
  const getChangeHistory = useCallback(() => {
    return logs
      .filter(log => log.action === 'edit' && log.old_values && log.new_values)
      .map(log => ({
        timestamp: log.timestamp,
        user: log.user_email,
        changes: Object.keys(log.new_values || {}).map(key => ({
          field: key,
          oldValue: log.old_values?.[key],
          newValue: log.new_values?.[key],
        })),
      }));
  }, [logs]);

  const getCreationInfo = useCallback(() => {
    const createLog = logs.find(log => log.action === 'create');
    return createLog ? {
      timestamp: createLog.timestamp,
      user: createLog.user_email,
    } : null;
  }, [logs]);

  const getDeletionInfo = useCallback(() => {
    const deleteLog = logs.find(log => log.action === 'delete');
    return deleteLog ? {
      timestamp: deleteLog.timestamp,
      user: deleteLog.user_email,
      isRestored: logs.some(log => log.action === 'restore' && log.timestamp > deleteLog.timestamp),
    } : null;
  }, [logs]);

  return {
    logs,
    getChangeHistory,
    getCreationInfo,
    getDeletionInfo,
  };
}
