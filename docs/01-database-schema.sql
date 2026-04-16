-- =====================================================
-- CS COMMAND CENTER - DATABASE SCHEMA
-- Enterprise Customer Success Platform
-- PostgreSQL Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER MANAGEMENT & ROLES
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'csm', 'cs_ops', 'viewer')),
    department VARCHAR(100),
    phone VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module VARCHAR(100) NOT NULL,
    permission VARCHAR(50) NOT NULL CHECK (permission IN ('read', 'write', 'delete', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module)
);

-- =====================================================
-- 2. ACCOUNT MANAGEMENT
-- =====================================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    region VARCHAR(100) NOT NULL,
    segment VARCHAR(50) NOT NULL CHECK (segment IN ('enterprise', 'mid_market', 'smb')),
    arr DECIMAL(15, 2) NOT NULL DEFAULT 0,
    mrr DECIMAL(15, 2) NOT NULL DEFAULT 0,
    contract_start_date DATE,
    contract_end_date DATE,
    renewal_date DATE,
    pricing_plan VARCHAR(100),
    devices_deployed INTEGER DEFAULT 0,
    locations TEXT[],
    primary_csm_id UUID REFERENCES users(id),
    secondary_csm_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'churned', 'paused', 'prospect')),
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    health_status VARCHAR(20) CHECK (health_status IN ('green', 'yellow', 'red')),
    churn_risk VARCHAR(20) CHECK (churn_risk IN ('low', 'medium', 'high', 'critical')),
    nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    title VARCHAR(100),
    role VARCHAR(50) CHECK (role IN ('executive_sponsor', 'decision_maker', 'champion', 'influencer', 'user')),
    is_primary BOOLEAN DEFAULT false,
    is_billing_contact BOOLEAN DEFAULT false,
    is_technical_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. HEALTH SCORE ENGINE
-- =====================================================

CREATE TABLE health_score_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    weight_product_usage DECIMAL(5, 2) DEFAULT 25.00,
    weight_support_tickets DECIMAL(5, 2) DEFAULT 20.00,
    weight_billing_health DECIMAL(5, 2) DEFAULT 20.00,
    weight_engagement_level DECIMAL(5, 2) DEFAULT 20.00,
    weight_renewal_proximity DECIMAL(5, 2) DEFAULT 15.00,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT weights_sum CHECK (
        weight_product_usage + weight_support_tickets + 
        weight_billing_health + weight_engagement_level + weight_renewal_proximity = 100.00
    )
);

CREATE TABLE health_score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    product_usage_score INTEGER,
    support_tickets_score INTEGER,
    billing_health_score INTEGER,
    engagement_level_score INTEGER,
    renewal_proximity_score INTEGER,
    status VARCHAR(20) CHECK (status IN ('green', 'yellow', 'red')),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculated_by UUID REFERENCES users(id)
);

CREATE TABLE health_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. TASK & ACTIVITY TRACKER
-- =====================================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES account_contacts(id),
    owner_id UUID REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL CHECK (
        activity_type IN ('call', 'meeting', 'email', 'follow_up', 'internal_discussion', 'qbr', 'escalation', 'note', 'task')
    ),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    outcome TEXT,
    next_steps TEXT,
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_minutes INTEGER,
    is_completed BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    follow_up_activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. RENEWAL MANAGEMENT
-- =====================================================

CREATE TABLE renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    current_arr DECIMAL(15, 2) NOT NULL,
    projected_arr DECIMAL(15, 2),
    renewal_date DATE NOT NULL,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('planning', 'negotiation', 'closing', 'closed_won', 'closed_lost', 'at_risk')),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_reasons TEXT[],
    objections TEXT[],
    competitor_mentioned VARCHAR(255),
    decision_maker_engaged BOOLEAN DEFAULT false,
    economic_buyer_identified BOOLEAN DEFAULT false,
    champion_identified BOOLEAN DEFAULT false,
    notes TEXT,
    assigned_csm_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE renewal_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    renewal_id UUID REFERENCES renewals(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('90_days', '60_days', '30_days', '7_days', '1_day')),
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. ESCALATION MANAGEMENT
-- =====================================================

CREATE TABLE escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    escalation_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    escalation_type VARCHAR(50) NOT NULL CHECK (escalation_type IN ('technical', 'billing', 'device', 'integration', 'service', 'product')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_customer', 'pending_internal', 'resolved', 'closed')),
    root_cause TEXT,
    reported_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    escalated_to UUID REFERENCES users(id),
    sla_hours INTEGER,
    sla_deadline TIMESTAMP,
    started_at TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    customer_impact TEXT,
    business_impact TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE escalation_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escalation_id UUID REFERENCES escalations(id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    updated_by UUID REFERENCES users(id),
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE war_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escalation_id UUID REFERENCES escalations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    participants UUID[] REFERENCES users(id),
    meeting_link TEXT,
    slack_channel TEXT,
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- =====================================================
-- 7. EXPANSION TRACKER
-- =====================================================

CREATE TABLE expansion_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    opportunity_name VARCHAR(255) NOT NULL,
    opportunity_type VARCHAR(50) NOT NULL CHECK (opportunity_type IN ('upsell', 'cross_sell', 'renewal_expansion', 'new_product', 'new_region')),
    potential_arr DECIMAL(15, 2) NOT NULL,
    potential_mrr DECIMAL(15, 2),
    trigger_type VARCHAR(100) CHECK (trigger_type IN ('usage_increase', 'new_region', 'new_use_case', 'product_feedback', 'competitive_replacement', 'champion_request')),
    stage VARCHAR(50) DEFAULT 'identified' CHECK (stage IN ('identified', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'on_hold')),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    assigned_csm_id UUID REFERENCES users(id),
    assigned_ae_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. BILLING & CONTRACTS
-- =====================================================

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    contract_number VARCHAR(100) UNIQUE,
    contract_type VARCHAR(50) CHECK (contract_type IN ('master', 'amendment', 'renewal', 'expansion')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    arr_value DECIMAL(15, 2),
    mrr_value DECIMAL(15, 2),
    pricing_plan VARCHAR(100),
    payment_terms VARCHAR(50),
    auto_renewal BOOLEAN DEFAULT false,
    termination_notice_days INTEGER DEFAULT 30,
    contract_document_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'pending_signature')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE billing_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id),
    dispute_type VARCHAR(100) NOT NULL CHECK (dispute_type IN ('overcharge', 'incorrect_invoice', 'missing_credits', 'payment_failure', 'refund_request')),
    amount_disputed DECIMAL(15, 2),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'escalated', 'closed')),
    resolution TEXT,
    resolved_amount DECIMAL(15, 2),
    reported_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE billing_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL CHECK (alert_type IN ('contract_expiring', 'payment_overdue', 'plan_misalignment', 'usage_threshold')),
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. PRODUCT USAGE & DEVICE DATA
-- =====================================================

CREATE TABLE device_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    device_id VARCHAR(100) NOT NULL,
    device_type VARCHAR(100),
    location TEXT,
    deployment_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'decommissioned')),
    last_seen_at TIMESTAMP,
    firmware_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, device_id)
);

CREATE TABLE product_usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 4),
    metric_unit VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    period_start DATE,
    period_end DATE
);

-- =====================================================
-- 10. SUPPORT INTEGRATION
-- =====================================================

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed')),
    category VARCHAR(100),
    assigned_agent UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    sla_breach BOOLEAN DEFAULT false,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5)
);

-- =====================================================
-- 11. AI INSIGHTS & NOTIFICATIONS
-- =====================================================

CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL CHECK (insight_type IN ('health_risk', 'expansion_opportunity', 'churn_risk', 'engagement_drop', 'usage_anomaly')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(5, 2),
    recommended_action TEXT,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 12. DOCUMENTS & NOTES
-- =====================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) CHECK (document_type IN ('contract', 'proposal', 'qbr_deck', 'meeting_notes', 'support_doc', 'other')),
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES users(id),
    version INTEGER DEFAULT 1,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'strategic', 'technical', 'billing')),
    content TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_accounts_health_score ON accounts(health_score);
CREATE INDEX idx_accounts_renewal_date ON accounts(renewal_date);
CREATE INDEX idx_accounts_csm_id ON accounts(primary_csm_id);
CREATE INDEX idx_accounts_region ON accounts(region);
CREATE INDEX idx_accounts_segment ON accounts(segment);
CREATE INDEX idx_accounts_status ON accounts(status);

CREATE INDEX idx_activities_account_id ON activities(account_id);
CREATE INDEX idx_activities_owner_id ON activities(owner_id);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);
CREATE INDEX idx_activities_type ON activities(activity_type);

CREATE INDEX idx_renewals_account_id ON renewals(account_id);
CREATE INDEX idx_renewals_date ON renewals(renewal_date);
CREATE INDEX idx_renewals_stage ON renewals(stage);

CREATE INDEX idx_escalations_account_id ON escalations(account_id);
CREATE INDEX idx_escalations_status ON escalations(status);
CREATE INDEX idx_escalations_severity ON escalations(severity);
CREATE INDEX idx_escalations_assigned_to ON escalations(assigned_to);

CREATE INDEX idx_health_score_history_account ON health_score_history(account_id);
CREATE INDEX idx_health_score_history_date ON health_score_history(calculated_at);

CREATE INDEX idx_expansion_account_id ON expansion_opportunities(account_id);
CREATE INDEX idx_expansion_stage ON expansion_opportunities(stage);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_contacts_updated_at BEFORE UPDATE ON account_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewals_updated_at BEFORE UPDATE ON renewals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escalations_updated_at BEFORE UPDATE ON escalations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expansion_updated_at BEFORE UPDATE ON expansion_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_deployments_updated_at BEFORE UPDATE ON device_deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_notes_updated_at BEFORE UPDATE ON account_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
