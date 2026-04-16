import type { 
  User, Account, AccountContact, Activity, Escalation, 
  Renewal, ExpansionOpportunity, Contract, AIInsight,
  DashboardMetrics, HealthDistribution 
} from '@/types';

// Sample Users - Simplified to Admin and User roles
export const users: User[] = [
  {
    id: 'user-1',
    email: 'sarah.johnson@cscommand.com',
    first_name: 'Sarah',
    last_name: 'Johnson',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'admin',
    department: 'Customer Success',
    phone: '+1-555-0101',
    timezone: 'America/New_York',
    is_active: true,
    last_login_at: '2024-01-15T09:30:00Z',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'mike.chen@cscommand.com',
    first_name: 'Mike',
    last_name: 'Chen',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    role: 'user',
    department: 'Customer Success',
    phone: '+1-555-0102',
    timezone: 'America/Los_Angeles',
    is_active: true,
    last_login_at: '2024-01-15T08:15:00Z',
    created_at: '2023-02-15T00:00:00Z'
  },
  {
    id: 'user-3',
    email: 'emma.davis@cscommand.com',
    first_name: 'Emma',
    last_name: 'Davis',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    role: 'user',
    department: 'Customer Success',
    phone: '+1-555-0103',
    timezone: 'America/Chicago',
    is_active: true,
    last_login_at: '2024-01-14T16:45:00Z',
    created_at: '2023-03-01T00:00:00Z'
  }
];

// Sample Accounts
export const accounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Acme Corporation',
    domain: 'acme.com',
    industry: 'Manufacturing',
    company_size: '1000-5000',
    region: 'North America',
    segment: 'enterprise',
    arr: 500000,
    mrr: 41667,
    contract_start_date: '2024-01-15',
    contract_end_date: '2025-01-14',
    renewal_date: '2025-01-14',
    pricing_plan: 'Enterprise Plus',
    devices_deployed: 1250,
    locations: ['New York', 'Chicago', 'Los Angeles'],
    primary_csm_id: 'user-2',
    secondary_csm_id: 'user-3',
    status: 'active',
    health_score: 85,
    health_status: 'green',
    churn_risk: 'low',
    nps_score: 9,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'acc-2',
    name: 'TechStart Inc',
    domain: 'techstart.io',
    industry: 'Technology',
    company_size: '100-500',
    region: 'North America',
    segment: 'mid_market',
    arr: 250000,
    mrr: 20833,
    contract_start_date: '2023-06-01',
    contract_end_date: '2024-06-01',
    renewal_date: '2024-06-01',
    pricing_plan: 'Growth',
    devices_deployed: 450,
    locations: ['San Francisco', 'Austin'],
    primary_csm_id: 'user-3',
    status: 'active',
    health_score: 72,
    health_status: 'yellow',
    churn_risk: 'medium',
    nps_score: 7,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'acc-3',
    name: 'Global Systems Ltd',
    domain: 'globalsystems.com',
    industry: 'Logistics',
    company_size: '5000+',
    region: 'APAC',
    segment: 'enterprise',
    arr: 1200000,
    mrr: 100000,
    contract_start_date: '2023-03-15',
    contract_end_date: '2024-03-15',
    renewal_date: '2024-03-15',
    pricing_plan: 'Enterprise',
    devices_deployed: 3500,
    locations: ['Singapore', 'Tokyo', 'Sydney', 'Mumbai'],
    primary_csm_id: 'user-2',
    secondary_csm_id: 'user-1',
    status: 'active',
    health_score: 45,
    health_status: 'red',
    churn_risk: 'high',
    nps_score: 4,
    created_at: '2023-03-15T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  },
  {
    id: 'acc-4',
    name: 'European Retail Group',
    domain: 'euretail.eu',
    industry: 'Retail',
    company_size: '5000+',
    region: 'EMEA',
    segment: 'enterprise',
    arr: 800000,
    mrr: 66667,
    contract_start_date: '2023-09-01',
    contract_end_date: '2024-09-01',
    renewal_date: '2024-09-01',
    pricing_plan: 'Enterprise',
    devices_deployed: 2100,
    locations: ['London', 'Paris', 'Berlin', 'Amsterdam'],
    primary_csm_id: 'user-3',
    status: 'active',
    health_score: 78,
    health_status: 'green',
    churn_risk: 'low',
    nps_score: 8,
    created_at: '2023-09-01T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z'
  },
  {
    id: 'acc-5',
    name: 'Smart Factory Solutions',
    domain: 'smartfactory.com',
    industry: 'Manufacturing',
    company_size: '500-1000',
    region: 'North America',
    segment: 'mid_market',
    arr: 180000,
    mrr: 15000,
    contract_start_date: '2023-11-01',
    contract_end_date: '2024-11-01',
    renewal_date: '2024-11-01',
    pricing_plan: 'Professional',
    devices_deployed: 320,
    locations: ['Detroit', 'Cleveland'],
    primary_csm_id: 'user-2',
    status: 'active',
    health_score: 92,
    health_status: 'green',
    churn_risk: 'low',
    nps_score: 10,
    created_at: '2023-11-01T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  },
  {
    id: 'acc-6',
    name: 'DataFlow Analytics',
    domain: 'dataflow.ai',
    industry: 'Technology',
    company_size: '50-100',
    region: 'North America',
    segment: 'smb',
    arr: 75000,
    mrr: 6250,
    contract_start_date: '2023-08-15',
    contract_end_date: '2024-08-15',
    renewal_date: '2024-08-15',
    pricing_plan: 'Starter',
    devices_deployed: 85,
    locations: ['Boston'],
    primary_csm_id: 'user-3',
    status: 'active',
    health_score: 65,
    health_status: 'yellow',
    churn_risk: 'medium',
    nps_score: 6,
    created_at: '2023-08-15T00:00:00Z',
    updated_at: '2024-01-11T00:00:00Z'
  },
  {
    id: 'acc-7',
    name: 'Metro Healthcare',
    domain: 'metrohealth.org',
    industry: 'Healthcare',
    company_size: '1000-5000',
    region: 'North America',
    segment: 'enterprise',
    arr: 650000,
    mrr: 54167,
    contract_start_date: '2023-05-01',
    contract_end_date: '2024-05-01',
    renewal_date: '2024-05-01',
    pricing_plan: 'Enterprise Plus',
    devices_deployed: 1800,
    locations: ['Houston', 'Dallas', 'San Antonio'],
    primary_csm_id: 'user-1',
    status: 'active',
    health_score: 88,
    health_status: 'green',
    churn_risk: 'low',
    nps_score: 9,
    created_at: '2023-05-01T00:00:00Z',
    updated_at: '2024-01-09T00:00:00Z'
  },
  {
    id: 'acc-8',
    name: 'Pacific Shipping Co',
    domain: 'pacificship.com',
    industry: 'Logistics',
    company_size: '500-1000',
    region: 'APAC',
    segment: 'mid_market',
    arr: 220000,
    mrr: 18333,
    contract_start_date: '2023-07-01',
    contract_end_date: '2024-07-01',
    renewal_date: '2024-07-01',
    pricing_plan: 'Growth',
    devices_deployed: 580,
    locations: ['Hong Kong', 'Shanghai'],
    primary_csm_id: 'user-2',
    status: 'active',
    health_score: 55,
    health_status: 'yellow',
    churn_risk: 'high',
    nps_score: 5,
    created_at: '2023-07-01T00:00:00Z',
    updated_at: '2024-01-13T00:00:00Z'
  }
];

// Sample Contacts
export const contacts: AccountContact[] = [
  {
    id: 'contact-1',
    account_id: 'acc-1',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@acme.com',
    phone: '+1-555-1001',
    title: 'VP of Operations',
    role: 'executive_sponsor',
    is_primary: true,
    is_billing_contact: false,
    is_technical_contact: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'contact-2',
    account_id: 'acc-1',
    first_name: 'Robert',
    last_name: 'Johnson',
    email: 'robert.j@acme.com',
    phone: '+1-555-1002',
    title: 'CFO',
    role: 'decision_maker',
    is_primary: false,
    is_billing_contact: true,
    is_technical_contact: false,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'contact-3',
    account_id: 'acc-2',
    first_name: 'Alex',
    last_name: 'Turner',
    email: 'alex@techstart.io',
    phone: '+1-555-2001',
    title: 'CTO',
    role: 'champion',
    is_primary: true,
    is_billing_contact: false,
    is_technical_contact: true,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z'
  },
  {
    id: 'contact-4',
    account_id: 'acc-3',
    first_name: 'Hiroshi',
    last_name: 'Tanaka',
    email: 'hiroshi.tanaka@globalsystems.com',
    phone: '+81-3-5555-3001',
    title: 'Director of IT',
    role: 'executive_sponsor',
    is_primary: true,
    is_billing_contact: false,
    is_technical_contact: true,
    created_at: '2023-03-15T00:00:00Z',
    updated_at: '2023-03-15T00:00:00Z'
  }
];

// Sample Activities
export const activities: Activity[] = [
  {
    id: 'act-1',
    account_id: 'acc-1',
    contact_id: 'contact-1',
    owner_id: 'user-2',
    activity_type: 'meeting',
    title: 'QBR with Acme Corp',
    summary: 'Quarterly business review - discussed expansion opportunities and renewal timeline',
    outcome: 'Positive feedback, renewal confirmed for next year',
    next_steps: 'Send follow-up email with action items and expansion proposal',
    scheduled_at: '2024-01-10T14:00:00Z',
    completed_at: '2024-01-10T15:00:00Z',
    duration_minutes: 60,
    is_completed: true,
    priority: 'high',
    created_at: '2024-01-10T14:00:00Z',
    updated_at: '2024-01-10T15:30:00Z'
  },
  {
    id: 'act-2',
    account_id: 'acc-3',
    owner_id: 'user-2',
    activity_type: 'call',
    title: 'Escalation Follow-up Call',
    summary: 'Discussed critical device connectivity issues',
    outcome: 'Engineering team engaged, ETA for resolution provided',
    next_steps: 'Daily status updates until resolved',
    scheduled_at: '2024-01-15T10:00:00Z',
    completed_at: '2024-01-15T10:30:00Z',
    duration_minutes: 30,
    is_completed: true,
    priority: 'urgent',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'act-3',
    account_id: 'acc-2',
    owner_id: 'user-3',
    activity_type: 'email',
    title: 'Renewal Discussion Email',
    summary: 'Sent renewal proposal and pricing options',
    is_completed: true,
    priority: 'high',
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-14T09:00:00Z'
  },
  {
    id: 'act-4',
    account_id: 'acc-1',
    owner_id: 'user-2',
    activity_type: 'task',
    title: 'Prepare Expansion Proposal',
    summary: 'Create proposal for additional 500 devices',
    next_steps: 'Include volume discount and implementation timeline',
    scheduled_at: '2024-01-18T09:00:00Z',
    is_completed: false,
    priority: 'high',
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  },
  {
    id: 'act-5',
    account_id: 'acc-5',
    owner_id: 'user-2',
    activity_type: 'qbr',
    title: 'Quarterly Business Review',
    summary: 'Review usage metrics and discuss roadmap alignment',
    scheduled_at: '2024-01-22T13:00:00Z',
    is_completed: false,
    priority: 'medium',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  }
];

// Sample Escalations
export const escalations: Escalation[] = [
  {
    id: 'esc-1',
    account_id: 'acc-3',
    escalation_number: 'ESC-2024-001',
    title: 'Critical device connectivity issues',
    description: 'Multiple devices offline affecting production line operations at 3 facilities. Customer reports 15% of deployed devices not responding.',
    escalation_type: 'technical',
    severity: 'critical',
    status: 'in_progress',
    root_cause: 'Firmware bug in version 2.1.3 causing intermittent connectivity drops',
    reported_by: 'user-2',
    assigned_to: 'user-2',
    escalated_to: 'user-1',
    sla_hours: 4,
    sla_deadline: '2024-01-15T18:00:00Z',
    started_at: '2024-01-15T14:00:00Z',
    customer_impact: 'Production line halted at 3 facilities, estimated $50K/hour revenue loss',
    business_impact: 'High churn risk if not resolved quickly, potential contract termination',
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T16:30:00Z'
  },
  {
    id: 'esc-2',
    account_id: 'acc-8',
    escalation_number: 'ESC-2024-002',
    title: 'Billing dispute - overcharge claim',
    description: 'Customer claims they were charged for 580 devices but only have 450 active. Disputing 6 months of overcharges.',
    escalation_type: 'billing',
    severity: 'high',
    status: 'open',
    reported_by: 'user-3',
    assigned_to: 'user-4',
    sla_hours: 24,
    sla_deadline: '2024-01-16T14:00:00Z',
    customer_impact: 'Customer threatening to withhold payment and escalate to legal',
    business_impact: '$78K in disputed charges, potential damage to relationship',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'esc-3',
    account_id: 'acc-2',
    escalation_number: 'ESC-2024-003',
    title: 'Integration issues with ERP system',
    description: 'API connectivity problems preventing data sync with customer ERP system.',
    escalation_type: 'integration',
    severity: 'medium',
    status: 'pending_customer',
    assigned_to: 'user-3',
    sla_hours: 48,
    sla_deadline: '2024-01-17T09:00:00Z',
    customer_impact: 'Manual data entry required, operational inefficiency',
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 'esc-4',
    account_id: 'acc-6',
    escalation_number: 'ESC-2024-004',
    title: 'Feature request - custom reporting',
    description: 'Customer requires custom reporting capabilities not available in current product.',
    escalation_type: 'product',
    severity: 'low',
    status: 'open',
    assigned_to: 'user-3',
    sla_hours: 72,
    customer_impact: 'Customer evaluating competitors with better reporting',
    created_at: '2024-01-13T11:00:00Z',
    updated_at: '2024-01-13T11:00:00Z'
  }
];

// Sample Renewals
export const renewals: Renewal[] = [
  {
    id: 'ren-1',
    account_id: 'acc-3',
    current_arr: 1200000,
    projected_arr: 1080000,
    renewal_date: '2024-03-15',
    stage: 'at_risk',
    probability: 40,
    risk_level: 'high',
    risk_reasons: ['Ongoing critical escalation', 'Competitor offering lower pricing', 'NPS score dropped to 4'],
    objections: ['Price too high', 'Service reliability concerns'],
    competitor_mentioned: 'CompetitorX',
    decision_maker_engaged: true,
    economic_buyer_identified: true,
    champion_identified: false,
    notes: 'Critical situation - need executive intervention',
    assigned_csm_id: 'user-2',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'ren-2',
    account_id: 'acc-2',
    current_arr: 250000,
    projected_arr: 275000,
    renewal_date: '2024-06-01',
    stage: 'negotiation',
    probability: 65,
    risk_level: 'medium',
    risk_reasons: ['Budget constraints mentioned', 'Evaluating alternatives'],
    objections: ['Price increase concern'],
    decision_maker_engaged: true,
    economic_buyer_identified: true,
    champion_identified: true,
    notes: 'Champion is advocating for us, but CFO pushing back on price',
    assigned_csm_id: 'user-3',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'ren-3',
    account_id: 'acc-1',
    current_arr: 500000,
    projected_arr: 650000,
    renewal_date: '2025-01-14',
    stage: 'planning',
    probability: 90,
    risk_level: 'low',
    decision_maker_engaged: true,
    economic_buyer_identified: true,
    champion_identified: true,
    notes: 'Strong relationship, expansion likely',
    assigned_csm_id: 'user-2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'ren-4',
    account_id: 'acc-7',
    current_arr: 650000,
    projected_arr: 780000,
    renewal_date: '2024-05-01',
    stage: 'closing',
    probability: 85,
    risk_level: 'low',
    decision_maker_engaged: true,
    economic_buyer_identified: true,
    champion_identified: true,
    notes: 'Renewal docs sent, awaiting signature',
    assigned_csm_id: 'user-1',
    created_at: '2023-11-01T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  }
];

// Sample Expansion Opportunities
export const expansionOpportunities: ExpansionOpportunity[] = [
  {
    id: 'exp-1',
    account_id: 'acc-1',
    opportunity_name: 'Acme - Texas Facility Expansion',
    opportunity_type: 'new_region',
    potential_arr: 150000,
    potential_mrr: 12500,
    trigger_type: 'new_region',
    stage: 'qualified',
    probability: 70,
    expected_close_date: '2024-04-30',
    assigned_csm_id: 'user-2',
    notes: 'Opening new facility in Dallas, needs 500 additional devices',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'exp-2',
    account_id: 'acc-4',
    opportunity_name: 'European Retail - Premium Analytics',
    opportunity_type: 'upsell',
    potential_arr: 200000,
    potential_mrr: 16667,
    trigger_type: 'usage_increase',
    stage: 'proposal',
    probability: 60,
    expected_close_date: '2024-03-15',
    assigned_csm_id: 'user-3',
    assigned_ae_id: 'user-1',
    notes: 'Customer hitting data limits, interested in premium analytics tier',
    created_at: '2023-12-15T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z'
  },
  {
    id: 'exp-3',
    account_id: 'acc-5',
    opportunity_name: 'Smart Factory - Additional Modules',
    opportunity_type: 'cross_sell',
    potential_arr: 75000,
    potential_mrr: 6250,
    trigger_type: 'product_feedback',
    stage: 'identified',
    probability: 50,
    expected_close_date: '2024-06-30',
    assigned_csm_id: 'user-2',
    notes: 'Interested in predictive maintenance module',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  }
];

// Sample Billing Disputes
export interface BillingDispute {
  id: string;
  account_id: string;
  contract_id?: string;
  dispute_type: string;
  amount_disputed: number;
  description: string;
  status: string;
  created_at: string;
}

export const billingDisputes: BillingDispute[] = [
  {
    id: 'dispute-1',
    account_id: 'acc-3',
    contract_id: 'ctr-2',
    dispute_type: 'overcharge',
    amount_disputed: 78000,
    description: 'Customer claims they were charged for 580 devices but only have 450 active.',
    status: 'open',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'dispute-2',
    account_id: 'acc-1',
    contract_id: 'ctr-1',
    dispute_type: 'missing_credits',
    amount_disputed: 5000,
    description: 'Promotional credits not applied to invoice.',
    status: 'under_review',
    created_at: '2024-01-10T09:00:00Z',
  },
];

// Sample Contracts
export const contracts: Contract[] = [
  {
    id: 'ctr-1',
    account_id: 'acc-1',
    contract_number: 'CTR-2024-001',
    contract_type: 'master',
    start_date: '2024-01-15',
    end_date: '2025-01-14',
    arr_value: 500000,
    mrr_value: 41667,
    pricing_plan: 'Enterprise Plus',
    payment_terms: 'Net 30',
    auto_renewal: true,
    termination_notice_days: 60,
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'ctr-2',
    account_id: 'acc-3',
    contract_number: 'CTR-2023-045',
    contract_type: 'master',
    start_date: '2023-03-15',
    end_date: '2024-03-15',
    arr_value: 1200000,
    mrr_value: 100000,
    pricing_plan: 'Enterprise',
    payment_terms: 'Net 30',
    auto_renewal: false,
    termination_notice_days: 90,
    status: 'active',
    created_at: '2023-03-15T00:00:00Z',
    updated_at: '2023-03-15T00:00:00Z'
  }
];

// Sample AI Insights
export const aiInsights: AIInsight[] = [
  {
    id: 'insight-1',
    account_id: 'acc-3',
    insight_type: 'churn_risk',
    title: 'High Churn Risk Detected',
    description: 'Global Systems shows multiple risk indicators: critical escalation, declining health score, and competitor engagement.',
    confidence_score: 0.85,
    recommended_action: 'Schedule executive business review and offer service recovery plan',
    is_acknowledged: false,
    created_at: '2024-01-15T12:00:00Z'
  },
  {
    id: 'insight-2',
    account_id: 'acc-1',
    insight_type: 'expansion_opportunity',
    title: 'Expansion Opportunity Identified',
    description: 'Acme Corporation device usage increased 40% in last quarter. High likelihood of expansion need.',
    confidence_score: 0.78,
    recommended_action: 'Proactively reach out to discuss capacity planning',
    is_acknowledged: true,
    created_at: '2024-01-14T10:00:00Z'
  },
  {
    id: 'insight-3',
    account_id: 'acc-8',
    insight_type: 'health_risk',
    title: 'Health Score Declining',
    description: 'Pacific Shipping health score dropped 15 points in 30 days due to support ticket volume increase.',
    confidence_score: 0.92,
    recommended_action: 'Review recent tickets and schedule health check call',
    is_acknowledged: false,
    created_at: '2024-01-13T09:00:00Z'
  }
];

// Dashboard Metrics
export const dashboardMetrics: DashboardMetrics = {
  total_arr: 12500000,
  total_mrr: 1041667,
  nrr: 115.5,
  grr: 92.3,
  active_accounts: 245,
  at_risk_accounts: 18,
  upcoming_renewals_30d: 12,
  upcoming_renewals_60d: 28,
  upcoming_renewals_90d: 45,
  active_escalations: 7,
  expansion_pipeline: 2300000
};

// Health Distribution
export const healthDistribution: HealthDistribution = {
  green: 189,
  yellow: 38,
  red: 18
};

// Helper functions to get data with relationships
export function getAccountWithDetails(accountId: string) {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return null;
  
  return {
    ...account,
    primary_csm: users.find(u => u.id === account.primary_csm_id),
    secondary_csm: users.find(u => u.id === account.secondary_csm_id),
    contacts: contacts.filter(c => c.account_id === accountId),
    activities: activities.filter(a => a.account_id === accountId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    escalations: escalations.filter(e => e.account_id === accountId),
    contracts: contracts.filter(c => c.account_id === accountId)
  };
}

export function getEscalationWithDetails(escalationId: string) {
  const escalation = escalations.find(e => e.id === escalationId);
  if (!escalation) return null;
  
  return {
    ...escalation,
    account: accounts.find(a => a.id === escalation.account_id),
    assigned_to_user: users.find(u => u.id === escalation.assigned_to),
    reported_by_user: users.find(u => u.id === escalation.reported_by),
  };
}

export function getAllAccountsWithCSM() {
  return accounts.map(account => ({
    ...account,
    primary_csm: users.find(u => u.id === account.primary_csm_id)
  }));
}

export function getAllEscalationsWithDetails() {
  return escalations.map(escalation => ({
    ...escalation,
    account: accounts.find(a => a.id === escalation.account_id),
    assigned_to_user: users.find(u => u.id === escalation.assigned_to),
    reported_by_user: users.find(u => u.id === escalation.reported_by),
  }));
}

export function getAllRenewalsWithDetails() {
  return renewals.map(renewal => ({
    ...renewal,
    account: accounts.find(a => a.id === renewal.account_id)
  }));
}

export function getAllExpansionWithDetails() {
  return expansionOpportunities.map(exp => ({
    ...exp,
    account: accounts.find(a => a.id === exp.account_id)
  }));
}
