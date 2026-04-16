import type { 
  Account, Activity, User,
  AccountFilters, ActivityFilters, PaginatedResult, 
  ApiResponse
} from '@/types';
import { accounts as allAccounts, activities as allActivities, users } from '@/data/sampleData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get current user from auth context (simulated)
let currentUser: User | null = null;

export function setCurrentUser(user: User | null) {
  currentUser = user;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

// Check if user is admin
function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

// Validate user has access to account
function canAccessAccount(account: Account, user: User | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return account.primary_csm_id === user.id || account.secondary_csm_id === user.id;
}



// Filter accounts based on user permissions
function filterAccountsByUser(accounts: Account[], user: User | null): Account[] {
  if (!user) return [];
  if (isAdmin(user)) return accounts.filter(a => !a.is_deleted);
  return accounts.filter(a => 
    !a.is_deleted && 
    (a.primary_csm_id === user.id || a.secondary_csm_id === user.id)
  );
}

// Filter activities based on user permissions
function filterActivitiesByUser(activities: Activity[], user: User | null): Activity[] {
  if (!user) return [];
  if (isAdmin(user)) return activities;
  return activities.filter(a => a.owner_id === user.id);
}

// ==================== ACCOUNTS API ====================

export interface GetAccountsParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: AccountFilters;
}

export async function getAccounts(params: GetAccountsParams = {}): Promise<ApiResponse<PaginatedResult<Account>>> {
  await delay(300);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { page = 1, limit = 50, search, filters } = params;
  
  // Start with user-filtered accounts
  let filtered = filterAccountsByUser(allAccounts, user);
  
  // Apply search
  if (search?.trim()) {
    const lowerSearch = search.toLowerCase();
    filtered = filtered.filter(a => 
      a.name.toLowerCase().includes(lowerSearch) ||
      a.domain?.toLowerCase().includes(lowerSearch) ||
      a.industry?.toLowerCase().includes(lowerSearch)
    );
  }
  
  // Apply filters
  if (filters) {
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
      filtered = filtered.filter(a => 
        a.primary_csm_id === filters.owner_id || a.secondary_csm_id === filters.owner_id
      );
    }
    if (filters.churn_risk) {
      filtered = filtered.filter(a => a.churn_risk === filters.churn_risk);
    }
  }
  
  // Pagination
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filtered.slice(startIndex, endIndex);
  
  const result: PaginatedResult<Account> = {
    data: paginatedData,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
    has_next: endIndex < total,
    has_prev: page > 1,
  };
  
  return { success: true, data: result };
}

export async function getAccountById(accountId: string): Promise<ApiResponse<Account>> {
  await delay(200);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  const account = allAccounts.find(a => a.id === accountId && !a.is_deleted);
  
  if (!account) {
    return { success: false, error: 'Account not found' };
  }
  
  if (!canAccessAccount(account, user)) {
    return { success: false, error: 'You do not have access to this account' };
  }
  
  return { success: true, data: account };
}

export async function updateAccount(
  accountId: string, 
  updates: Partial<Account>
): Promise<ApiResponse<Account>> {
  await delay(300);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Only admin can update accounts
  if (!isAdmin(user)) {
    return { success: false, error: 'Only administrators can update accounts' };
  }
  
  const accountIndex = allAccounts.findIndex(a => a.id === accountId);
  if (accountIndex === -1) {
    return { success: false, error: 'Account not found' };
  }
  
  allAccounts[accountIndex] = {
    ...allAccounts[accountIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  return { success: true, data: allAccounts[accountIndex] };
}

export async function assignAccount(
  accountId: string, 
  userId: string,
  isSecondary: boolean = false
): Promise<ApiResponse<Account>> {
  await delay(300);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Only admin can assign accounts
  if (!isAdmin(user)) {
    return { success: false, error: 'Only administrators can assign accounts' };
  }
  
  const accountIndex = allAccounts.findIndex(a => a.id === accountId);
  if (accountIndex === -1) {
    return { success: false, error: 'Account not found' };
  }
  
  const targetUser = users.find(u => u.id === userId);
  if (!targetUser) {
    return { success: false, error: 'User not found' };
  }
  
  if (isSecondary) {
    allAccounts[accountIndex].secondary_csm_id = userId;
  } else {
    allAccounts[accountIndex].primary_csm_id = userId;
  }
  
  allAccounts[accountIndex].updated_at = new Date().toISOString();
  
  return { success: true, data: allAccounts[accountIndex] };
}

// ==================== ACTIVITIES API ====================

export interface GetActivitiesParams {
  page?: number;
  limit?: number;
  accountId?: string;
  filters?: ActivityFilters;
}

export async function getActivities(params: GetActivitiesParams = {}): Promise<ApiResponse<PaginatedResult<Activity>>> {
  await delay(300);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  const { page = 1, limit = 50, accountId, filters } = params;
  
  // Start with user-filtered activities
  let filtered = filterActivitiesByUser(allActivities, user);
  
  // Filter by account if specified
  if (accountId) {
    // First check if user has access to this account
    const account = allAccounts.find(a => a.id === accountId);
    if (account && !canAccessAccount(account, user)) {
      return { success: false, error: 'You do not have access to this account' };
    }
    filtered = filtered.filter(a => a.account_id === accountId);
  }
  
  // Apply filters
  if (filters) {
    if (filters.activity_type) {
      filtered = filtered.filter(a => a.activity_type === filters.activity_type);
    }
    if (filters.is_completed !== undefined) {
      filtered = filtered.filter(a => a.is_completed === filters.is_completed);
    }
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      filtered = filtered.filter(a => new Date(a.created_at) >= fromDate);
    }
    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      filtered = filtered.filter(a => new Date(a.created_at) <= toDate);
    }
  }
  
  // Sort by created_at desc
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Pagination
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filtered.slice(startIndex, endIndex);
  
  const result: PaginatedResult<Activity> = {
    data: paginatedData,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
    has_next: endIndex < total,
    has_prev: page > 1,
  };
  
  return { success: true, data: result };
}

export async function createActivity(
  activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<Activity>> {
  await delay(300);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Check if user has access to the account
  const account = allAccounts.find(a => a.id === activity.account_id);
  if (!account) {
    return { success: false, error: 'Account not found' };
  }
  
  if (!canAccessAccount(account, user)) {
    return { success: false, error: 'You do not have access to this account' };
  }
  
  const newActivity: Activity = {
    ...activity,
    id: `act-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  allActivities.unshift(newActivity);
  
  return { success: true, data: newActivity };
}

// ==================== DASHBOARD API ====================

export interface DashboardData {
  metrics: {
    total_accounts: number;
    total_arr: number;
    total_mrr: number;
    active_accounts: number;
    at_risk_accounts: number;
    upcoming_renewals_30d: number;
    my_tasks: number;
    my_activities_today: number;
  };
  accounts: Account[];
  recent_activities: Activity[];
  health_distribution: {
    green: number;
    yellow: number;
    red: number;
  };
}

export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  await delay(500);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Get user's accessible accounts
  const userAccounts = filterAccountsByUser(allAccounts, user);
  
  // Calculate metrics
  const totalAccounts = userAccounts.length;
  const totalARR = userAccounts.reduce((sum, a) => sum + a.arr, 0);
  const totalMRR = userAccounts.reduce((sum, a) => sum + a.mrr, 0);
  const activeAccounts = userAccounts.filter(a => a.status === 'active').length;
  const atRiskAccounts = userAccounts.filter(a => a.churn_risk === 'high' || a.churn_risk === 'critical').length;
  
  // Upcoming renewals in 30 days
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingRenewals30d = userAccounts.filter(a => {
    if (!a.renewal_date) return false;
    const renewalDate = new Date(a.renewal_date);
    return renewalDate >= now && renewalDate <= thirtyDaysFromNow;
  }).length;
  
  // Health distribution
  const healthDistribution = {
    green: userAccounts.filter(a => a.health_status === 'green').length,
    yellow: userAccounts.filter(a => a.health_status === 'yellow').length,
    red: userAccounts.filter(a => a.health_status === 'red').length,
  };
  
  // Get recent activities for user's accounts
  const userActivities = filterActivitiesByUser(allActivities, user);
  const recentActivities = userActivities.slice(0, 10);
  
  // Today's activities
  const today = new Date().toDateString();
  const myActivitiesToday = userActivities.filter(a => 
    new Date(a.created_at).toDateString() === today
  ).length;
  
  const data: DashboardData = {
    metrics: {
      total_accounts: totalAccounts,
      total_arr: totalARR,
      total_mrr: totalMRR,
      active_accounts: activeAccounts,
      at_risk_accounts: atRiskAccounts,
      upcoming_renewals_30d: upcomingRenewals30d,
      my_tasks: 0, // Would come from tasks API
      my_activities_today: myActivitiesToday,
    },
    accounts: userAccounts.slice(0, 5),
    recent_activities: recentActivities,
    health_distribution: healthDistribution,
  };
  
  return { success: true, data };
}

// ==================== USERS API ====================

export async function getUsers(): Promise<ApiResponse<User[]>> {
  await delay(200);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Only admin can see all users
  if (!isAdmin(user)) {
    return { success: false, error: 'Only administrators can view all users' };
  }
  
  return { success: true, data: users.filter(u => u.is_active) };
}

export async function getUserById(userId: string): Promise<ApiResponse<User>> {
  await delay(200);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Users can only see themselves, admin can see anyone
  if (!isAdmin(user) && user.id !== userId) {
    return { success: false, error: 'You can only view your own profile' };
  }
  
  const targetUser = users.find(u => u.id === userId);
  if (!targetUser) {
    return { success: false, error: 'User not found' };
  }
  
  return { success: true, data: targetUser };
}

// ==================== REPORTS API ====================

export interface UserReport {
  user_id: string;
  user_name: string;
  accounts_count: number;
  total_arr: number;
  total_mrr: number;
  avg_health_score: number;
  activities_count: number;
}

export async function getUsersReport(): Promise<ApiResponse<UserReport[]>> {
  await delay(500);
  
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Only admin can see reports
  if (!isAdmin(user)) {
    return { success: false, error: 'Only administrators can view reports' };
  }
  
  const reports: UserReport[] = users
    .filter(u => u.role === 'user' && u.is_active)
    .map(u => {
      const userAccounts = allAccounts.filter(a => 
        !a.is_deleted && 
        (a.primary_csm_id === u.id || a.secondary_csm_id === u.id)
      );
      
      const userActivities = allActivities.filter(a => a.owner_id === u.id);
      
      const totalHealth = userAccounts.reduce((sum, a) => sum + (a.health_score || 0), 0);
      const avgHealth = userAccounts.length > 0 ? totalHealth / userAccounts.length : 0;
      
      return {
        user_id: u.id,
        user_name: `${u.first_name} ${u.last_name}`,
        accounts_count: userAccounts.length,
        total_arr: userAccounts.reduce((sum, a) => sum + a.arr, 0),
        total_mrr: userAccounts.reduce((sum, a) => sum + a.mrr, 0),
        avg_health_score: Math.round(avgHealth),
        activities_count: userActivities.length,
      };
    });
  
  return { success: true, data: reports };
}
