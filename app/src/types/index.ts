// User Types - Simplified to Admin and User roles
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: UserRole;
  department?: string;
  phone?: string;
  timezone: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

// Permission Helpers
export const isAdmin = (user: User | null): boolean => user?.role === 'admin';
export const isUser = (user: User | null): boolean => user?.role === 'user';

// Account Types
export type AccountStatus = 'active' | 'churned' | 'paused' | 'prospect' | 'deleted';
export type AccountSegment = 'enterprise' | 'mid_market' | 'smb';
export type HealthStatus = 'green' | 'yellow' | 'red';
export type ChurnRisk = 'low' | 'medium' | 'high' | 'critical';

export interface Account {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  company_size?: string;
  region: string;
  segment: AccountSegment;
  arr: number;
  mrr: number;
  contract_start_date?: string;
  contract_end_date?: string;
  renewal_date?: string;
  pricing_plan?: string;
  devices_deployed: number;
  locations: string[];
  primary_csm_id?: string;
  secondary_csm_id?: string;
  status: AccountStatus;
  health_score?: number;
  health_status?: HealthStatus;
  churn_risk?: ChurnRisk;
  nps_score?: number;
  // Soft delete fields
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountContact {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  role: 'executive_sponsor' | 'decision_maker' | 'champion' | 'influencer' | 'user';
  is_primary: boolean;
  is_billing_contact: boolean;
  is_technical_contact: boolean;
  created_at: string;
  updated_at: string;
}

// Activity Types
export type ActivityType = 'call' | 'meeting' | 'email' | 'follow_up' | 'internal_discussion' | 'qbr' | 'escalation' | 'note' | 'task';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Activity {
  id: string;
  account_id: string;
  contact_id?: string;
  owner_id?: string;
  activity_type: ActivityType;
  title: string;
  summary?: string;
  outcome?: string;
  next_steps?: string;
  scheduled_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  is_completed: boolean;
  priority: Priority;
  attachments?: any[];
  // Timezone support
  timezone?: string;
  utc_offset?: number;
  created_at: string;
  updated_at: string;
}

// Health Score Types
export interface HealthScoreBreakdown {
  product_usage: { score: number; weight: number };
  support_tickets: { score: number; weight: number };
  billing_health: { score: number; weight: number };
  engagement_level: { score: number; weight: number };
  renewal_proximity: { score: number; weight: number };
}

export interface HealthScore {
  account_id: string;
  overall_score: number;
  status: HealthStatus;
  breakdown: HealthScoreBreakdown;
  calculated_at: string;
}

export interface HealthAlert {
  id: string;
  account_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

// Escalation Types
export type EscalationType = 'technical' | 'billing' | 'device' | 'integration' | 'service' | 'product';
export type EscalationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type EscalationStatus = 'open' | 'in_progress' | 'pending_customer' | 'pending_internal' | 'resolved' | 'closed';

export interface Escalation {
  id: string;
  account_id: string;
  escalation_number: string;
  title: string;
  description: string;
  escalation_type: EscalationType;
  severity: EscalationSeverity;
  status: EscalationStatus;
  root_cause?: string;
  reported_by?: string;
  assigned_to?: string;
  escalated_to?: string;
  sla_hours?: number;
  sla_deadline?: string;
  started_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  customer_impact?: string;
  business_impact?: string;
  created_at: string;
  updated_at: string;
  account?: Account;
  assigned_to_user?: User;
}

// Renewal Types
export type RenewalStage = 'planning' | 'negotiation' | 'closing' | 'closed_won' | 'closed_lost' | 'at_risk';

export interface Renewal {
  id: string;
  account_id: string;
  current_arr: number;
  projected_arr?: number;
  renewal_date: string;
  stage: RenewalStage;
  probability?: number;
  risk_level?: ChurnRisk;
  risk_reasons?: string[];
  objections?: string[];
  competitor_mentioned?: string;
  decision_maker_engaged: boolean;
  economic_buyer_identified: boolean;
  champion_identified: boolean;
  notes?: string;
  assigned_csm_id?: string;
  created_at: string;
  updated_at: string;
  account?: Account;
}

// Expansion Types
export type OpportunityType = 'upsell' | 'cross_sell' | 'renewal_expansion' | 'new_product' | 'new_region';
export type OpportunityStage = 'identified' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'on_hold';

export interface ExpansionOpportunity {
  id: string;
  account_id: string;
  opportunity_name: string;
  opportunity_type: OpportunityType;
  potential_arr: number;
  potential_mrr?: number;
  trigger_type?: string;
  stage: OpportunityStage;
  probability?: number;
  expected_close_date?: string;
  actual_close_date?: string;
  assigned_csm_id?: string;
  assigned_ae_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  account?: Account;
}

// Contract Types
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'pending_signature';
export type ContractType = 'master' | 'amendment' | 'renewal' | 'expansion';

export interface Contract {
  id: string;
  account_id: string;
  contract_number?: string;
  contract_type: ContractType;
  start_date: string;
  end_date: string;
  arr_value?: number;
  mrr_value?: number;
  pricing_plan?: string;
  payment_terms?: string;
  auto_renewal: boolean;
  termination_notice_days: number;
  contract_document_url?: string;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

// Dashboard Types
export interface DashboardMetrics {
  total_arr: number;
  total_mrr: number;
  nrr: number;
  grr: number;
  active_accounts: number;
  at_risk_accounts: number;
  upcoming_renewals_30d: number;
  upcoming_renewals_60d: number;
  upcoming_renewals_90d: number;
  active_escalations: number;
  expansion_pipeline: number;
}

export interface HealthDistribution {
  green: number;
  yellow: number;
  red: number;
}

// AI Insight Types
export type InsightType = 'health_risk' | 'expansion_opportunity' | 'churn_risk' | 'engagement_drop' | 'usage_anomaly';

export interface AIInsight {
  id: string;
  account_id: string;
  insight_type: InsightType;
  title: string;
  description: string;
  confidence_score?: number;
  recommended_action?: string;
  is_acknowledged: boolean;
  created_at: string;
  account?: Account;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Document Types
export interface Document {
  id: string;
  account_id: string;
  document_name: string;
  document_type: 'contract' | 'proposal' | 'qbr_deck' | 'meeting_notes' | 'support_doc' | 'other';
  file_url: string;
  file_size?: number;
  uploaded_by?: string;
  version: number;
  tags: string[];
  created_at: string;
}

// Note Types
export interface AccountNote {
  id: string;
  account_id: string;
  note_type: 'general' | 'strategic' | 'technical' | 'billing';
  content: string;
  created_by?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// Audit Log Types
export type AuditAction = 'create' | 'edit' | 'delete' | 'view' | 'bulk_edit' | 'bulk_delete' | 'restore';
export type AuditEntityType = 'account' | 'activity' | 'contact' | 'escalation' | 'renewal' | 'user';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity_type: AuditEntityType;
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
  ip_address?: string;
  user_agent?: string;
}

// Bulk Operation Types
export interface BulkOperation {
  id: string;
  operation_type: 'edit' | 'delete';
  entity_type: AuditEntityType;
  entity_ids: string[];
  user_id: string;
  user_email: string;
  changes?: Record<string, any>;
  timestamp: string;
  success_count: number;
  failure_count: number;
  errors?: string[];
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Filter Types
export interface AccountFilters {
  search?: string;
  region?: string;
  status?: AccountStatus;
  health_status?: HealthStatus;
  segment?: AccountSegment;
  owner_id?: string;
  churn_risk?: ChurnRisk;
  date_from?: string;
  date_to?: string;
}

export interface ActivityFilters {
  search?: string;
  activity_type?: ActivityType;
  owner_id?: string;
  account_id?: string;
  date_from?: string;
  date_to?: string;
  is_completed?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    pagination?: PaginatedResult<T>;
    filters?: Record<string, any>;
  };
}

export interface PermissionError {
  code: string;
  message: string;
  required_role?: UserRole;
  current_role?: UserRole;
}
