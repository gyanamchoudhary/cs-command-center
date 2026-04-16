# CS Command Center - RBAC Implementation Guide

## Overview

This document describes the comprehensive Role-Based Access Control (RBAC) system implemented in the CS Command Center application.

## Architecture

### Roles

The system uses a simplified two-role model:

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | Administrator with full access | All operations |
| `user` | Standard user (CSM) | Limited to own data |

### Core Hooks

#### 1. `usePermissions()` - Permission Checking

```typescript
const {
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
  currentUser,
} = usePermissions();
```

**Usage Example:**
```typescript
const { canEditActivity } = usePermissions();

const handleEdit = (activity: Activity) => {
  const result = canEditActivity(activity);
  if (result.allowed) {
    // Proceed with edit
  } else {
    toast.error(result.reason);
  }
};
```

#### 2. `useAccounts()` - Account Management

```typescript
const {
  // CRUD Operations
  addAccount,
  editAccount,
  deleteAccount,
  softDeleteAccount,
  restoreAccount,
  
  // Bulk Operations
  bulkEditAccounts,
  bulkDeleteAccounts,
  bulkSoftDeleteAccounts,
  
  // Getters
  getVisibleAccounts,
  getAccountById,
  getDeletedAccounts,
  filterAccounts,
  searchAccounts,
  getAccountStats,
} = useAccounts();
```

**Key Features:**
- Soft delete support (recoverable)
- Bulk operations with audit logging
- Permission-based filtering
- Search and filter capabilities

#### 3. `useActivities()` - Activity Management

```typescript
const {
  // CRUD Operations
  addActivity,
  editActivity,
  deleteActivity,
  
  // Bulk Operations
  bulkEditActivities,
  
  // Getters
  getUserActivities,
  getActivitiesByAccount,
  
  // Permission checks
  canEditActivity,
  canDeleteActivity,
} = useActivities();
```

**Key Features:**
- Timezone-aware datetime handling
- UTC storage with local display
- Bulk edit for users (not admin)
- Permission-based visibility

#### 4. `useAuditLog()` - Audit Trail

```typescript
const {
  auditLogs,
  logAction,
  logBulkAction,
  getLogsByEntity,
  getLogsByUser,
  getLogsByAction,
  getRecentLogs,
} = useAuditLog();
```

**Audit Log Structure:**
```typescript
interface AuditLog {
  id: string;
  action: 'create' | 'edit' | 'delete' | 'view' | 'bulk_edit' | 'bulk_delete' | 'restore';
  entity_type: 'account' | 'activity' | 'contact' | 'escalation' | 'renewal' | 'user';
  entity_id: string;
  user_id: string;
  user_email: string;
  user_role: UserRole;
  timestamp: string;
  details: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  success: boolean;
  error_message?: string;
}
```

## Permission Components

### PermissionGuard Components

```tsx
// Admin-only content
<AdminOnly>
  <DeleteButton />
</AdminOnly>

// User-only content
<UserOnly>
  <BulkEditButton />
</UserOnly>

// Permission-based with fallback
<CanEditActivity activity={activity}>
  <EditButton />
</CanEditActivity>

// Custom permission check
<PermissionGuard 
  check={(perms) => perms.canBulkEditAccounts()}>
  <BulkActions />
</PermissionGuard>
```

## Timezone Support

### DateTimePicker Component

```tsx
import { DateTimePicker, SimpleDateTimeInput } from '@/components/ui/DateTimePicker';

// Full datetime picker with timezone
<DateTimePicker
  value={scheduledAt}
  onChange={setScheduledAt}
  timezone={userTimezone}
  showTimezone={true}
/>

// Simple datetime input (auto-detects timezone)
<SimpleDateTimeInput
  label="Scheduled Date/Time"
  value={scheduledAt}
  onChange={setScheduledAt}
/>
```

### Timezone Utilities

```typescript
import { 
  detectTimezone, 
  toUTC, 
  fromUTC, 
  formatDateTimeDisplay 
} from '@/components/ui/DateTimePicker';

// Auto-detect user timezone
const timezone = detectTimezone(); // "America/New_York"

// Convert local to UTC for storage
const utcValue = toUTC('2024-01-15T14:30', 'America/New_York');

// Convert UTC to local for display
const localValue = fromUTC(utcValue, 'America/New_York');

// Format for display (dd/mm/yyyy hh:mm)
const display = formatDateTimeDisplay(utcValue, 'America/New_York');
// "15/01/2024 14:30"
```

## Bulk Operations

### Accounts Bulk Operations (Admin Only)

```typescript
// Bulk edit accounts
bulkEditAccounts(
  ['acc-1', 'acc-2', 'acc-3'],
  { status: 'active', health_status: 'green' },
  user,
  isAdmin
);

// Bulk soft delete (movable to trash)
bulkSoftDeleteAccounts(
  ['acc-1', 'acc-2'],
  user,
  isAdmin
);
```

### Activities Bulk Operations (User Only)

```typescript
// Bulk edit own activities
bulkEditActivities(
  ['act-1', 'act-2', 'act-3'],
  { summary: 'Updated summary', is_completed: true },
  user,
  isAdmin
);
```

## UI Features

### Accounts Page

1. **Filters Panel**
   - Region
   - Status
   - Health Status
   - Segment
   - Owner
   - Churn Risk

2. **Bulk Actions Bar** (Admin Only)
   - Select all/none
   - Bulk edit
   - Bulk delete

3. **Individual Actions**
   - Edit (Admin only)
   - Log Activity
   - Delete (Admin only)

4. **Export to CSV**
   - Exports filtered results

### Activities Page

1. **Filters**
   - Account
   - Activity Type
   - Date Sorting (newest/oldest/today/this week/this month)

2. **Bulk Actions Bar** (User Only)
   - Select own activities
   - Bulk edit date/time, summary, status

3. **DateTime Picker**
   - Calendar popup
   - Time selection
   - Timezone selection
   - UTC storage with local display

## Database Schema Updates

### Account Table

```sql
-- Soft delete fields
ALTER TABLE accounts ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE accounts ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE accounts ADD COLUMN deleted_by VARCHAR(255);
```

### Activity Table

```sql
-- Timezone support
ALTER TABLE activities ADD COLUMN timezone VARCHAR(100);
ALTER TABLE activities ADD COLUMN utc_offset INTEGER;
```

### Audit Log Table

```sql
CREATE TABLE audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  details TEXT,
  old_values JSONB,
  new_values JSONB,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  ip_address VARCHAR(100),
  user_agent TEXT
);
```

## API Design

### Endpoints

```
# Accounts
GET    /api/accounts              # List accounts (filtered by permissions)
POST   /api/accounts              # Create account (admin only)
PUT    /api/accounts/:id          # Update account (admin only)
DELETE /api/accounts/:id          # Soft delete (admin only)
POST   /api/accounts/bulk-edit    # Bulk edit (admin only)
POST   /api/accounts/bulk-delete  # Bulk delete (admin only)
GET    /api/accounts/deleted      # List deleted accounts (admin only)
POST   /api/accounts/:id/restore  # Restore deleted account (admin only)

# Activities
GET    /api/activities            # List activities (filtered by permissions)
POST   /api/activities            # Create activity
PUT    /api/activities/:id        # Update activity (owner only)
DELETE /api/activities/:id        # Delete activity (owner or admin)
POST   /api/activities/bulk-edit  # Bulk edit (owner only, not admin)

# Audit Logs
GET    /api/audit-logs            # List audit logs (admin only)
GET    /api/audit-logs/entity/:type/:id  # Get logs for entity
GET    /api/audit-logs/user/:id   # Get logs for user
```

### Request/Response Examples

**Create Account (Admin Only)**
```http
POST /api/accounts
Authorization: Bearer <admin-token>

{
  "name": "Acme Corp",
  "region": "North America",
  "segment": "enterprise",
  "arr": 500000,
  "primary_csm_id": "user-2"
}

Response:
{
  "success": true,
  "data": {
    "id": "acc-123",
    "name": "Acme Corp",
    ...
  }
}
```

**Bulk Edit Accounts (Admin Only)**
```http
POST /api/accounts/bulk-edit
Authorization: Bearer <admin-token>

{
  "account_ids": ["acc-1", "acc-2"],
  "changes": {
    "status": "active",
    "health_status": "green"
  }
}

Response:
{
  "success": true,
  "data": {
    "success_count": 2,
    "failure_count": 0
  }
}
```

## Security Considerations

1. **Frontend Validation**
   - UI elements hidden based on permissions
   - Buttons disabled for unauthorized actions
   - Clear error messages for unauthorized attempts

2. **Backend Validation**
   - All permissions checked on server side
   - No security loopholes through API calls
   - Audit logging for all actions

3. **Data Isolation**
   - Users can only see their own activities
   - Users can only see assigned accounts
   - Admin can see all data but cannot edit activities

## Error Handling

```typescript
// Permission denied response
{
  "success": false,
  "error": "You can only edit your own activities",
  "code": "PERMISSION_DENIED",
  "required_role": "user",
  "current_role": "admin"
}
```

## Best Practices

1. **Always check permissions on both frontend and backend**
2. **Use audit logging for all data modifications**
3. **Store datetime in UTC, display in user's timezone**
4. **Use soft delete for recoverability**
5. **Provide clear error messages for unauthorized actions**
6. **Use type-safe permission checks**

## Testing

### Permission Tests

```typescript
// Test admin permissions
describe('Admin Permissions', () => {
  it('can create accounts', () => {
    const { canCreateAccount } = usePermissions();
    const result = canCreateAccount();
    expect(result.allowed).toBe(true);
  });
  
  it('cannot edit activities', () => {
    const { canEditActivity } = usePermissions();
    const result = canEditActivity(activity);
    expect(result.allowed).toBe(false);
  });
});

// Test user permissions
describe('User Permissions', () => {
  it('can edit own activities', () => {
    const { canEditActivity } = usePermissions();
    const result = canEditActivity(ownActivity);
    expect(result.allowed).toBe(true);
  });
  
  it('cannot edit other activities', () => {
    const { canEditActivity } = usePermissions();
    const result = canEditActivity(otherActivity);
    expect(result.allowed).toBe(false);
  });
});
```

## Future Enhancements

1. **Role Hierarchy**: Support for custom roles
2. **Field-Level Permissions**: Control access to specific fields
3. **Time-Based Permissions**: Temporary access grants
4. **Audit Log UI**: Visual audit trail viewer
5. **Data Retention**: Automatic cleanup of old audit logs
