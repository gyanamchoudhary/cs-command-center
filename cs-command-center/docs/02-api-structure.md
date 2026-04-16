# CS Command Center - API Structure

## Base URL
```
Production: https://api.cscommandcenter.io/v1
Staging: https://staging-api.cscommandcenter.io/v1
Local: http://localhost:3000/api/v1
```

## Authentication
All endpoints require JWT Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### POST /auth/login
Login with email/password
```json
{
  "email": "user@company.com",
  "password": "securePassword123"
}
```

### POST /auth/logout
Logout current user

### POST /auth/refresh
Refresh access token
```json
{
  "refresh_token": "<refresh_token>"
}
```

### GET /auth/me
Get current user profile

### PUT /auth/me
Update current user profile

---

## 2. USER MANAGEMENT (Admin Only)

### GET /users
List all users with pagination
**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `role` (filter by role)
- `search` (search by name/email)
- `is_active` (filter by status)

### POST /users
Create new user
```json
{
  "email": "csm@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "csm",
  "department": "Customer Success",
  "phone": "+1-555-0123",
  "timezone": "America/New_York"
}
```

### GET /users/:id
Get user details

### PUT /users/:id
Update user

### DELETE /users/:id
Deactivate user

### GET /users/:id/permissions
Get user permissions

### PUT /users/:id/permissions
Update user permissions
```json
{
  "permissions": [
    { "module": "accounts", "permission": "write" },
    { "module": "escalations", "permission": "admin" }
  ]
}
```

---

## 3. DASHBOARD / COMMAND CENTER

### GET /dashboard/metrics
Get dashboard KPIs
**Response:**
```json
{
  "total_arr": 12500000,
  "total_mrr": 1041667,
  "nrr": 115.5,
  "grr": 92.3,
  "active_accounts": 245,
  "at_risk_accounts": 18,
  "upcoming_renewals_30d": 12,
  "upcoming_renewals_60d": 28,
  "upcoming_renewals_90d": 45,
  "active_escalations": 7,
  "expansion_pipeline": 2300000
}
```

### GET /dashboard/health-distribution
Get health score distribution
**Response:**
```json
{
  "green": 189,
  "yellow": 38,
  "red": 18
}
```

### GET /dashboard/renewals-timeline
Get renewals by month
**Query Params:**
- `months` (default: 12)

### GET /dashboard/recent-activities
Get recent activities across all accounts
**Query Params:**
- `limit` (default: 10)

### GET /dashboard/alerts
Get active alerts
**Query Params:**
- `severity` (filter by severity)
- `type` (filter by type)

---

## 4. ACCOUNT MANAGEMENT

### GET /accounts
List all accounts with filters
**Query Params:**
- `page`, `limit`
- `search` (name/domain)
- `region`
- `segment`
- `csm_id`
- `health_status`
- `status`
- `renewal_date_from`
- `renewal_date_to`
- `arr_min`, `arr_max`

### POST /accounts
Create new account
```json
{
  "name": "Acme Corporation",
  "domain": "acme.com",
  "industry": "Manufacturing",
  "company_size": "1000-5000",
  "region": "North America",
  "segment": "enterprise",
  "arr": 500000,
  "mrr": 41667,
  "contract_start_date": "2024-01-15",
  "contract_end_date": "2025-01-14",
  "renewal_date": "2025-01-14",
  "pricing_plan": "Enterprise Plus",
  "devices_deployed": 1250,
  "locations": ["New York", "Chicago", "Los Angeles"],
  "primary_csm_id": "uuid-here",
  "secondary_csm_id": "uuid-here"
}
```

### GET /accounts/:id
Get account details with 360° profile
**Response includes:**
- Account info
- Health score
- Recent activities
- Active escalations
- Upcoming renewals
- Contacts
- Documents

### PUT /accounts/:id
Update account

### DELETE /accounts/:id
Delete account (soft delete)

### GET /accounts/:id/contacts
Get account contacts

### POST /accounts/:id/contacts
Add contact to account
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@acme.com",
  "phone": "+1-555-0199",
  "title": "VP of Operations",
  "role": "executive_sponsor",
  "is_primary": true,
  "is_billing_contact": false,
  "is_technical_contact": true
}
```

### GET /accounts/:id/activities
Get account activity timeline
**Query Params:**
- `type` (filter by activity type)
- `from_date`, `to_date`
- `page`, `limit`

### GET /accounts/:id/health-history
Get account health score history

### GET /accounts/search
Global account search
**Query Params:**
- `q` (search query)

---

## 5. HEALTH SCORE ENGINE

### GET /health-score/config
Get health score configuration

### POST /health-score/config
Create/update health score configuration
```json
{
  "name": "Standard Scoring Model",
  "weight_product_usage": 25,
  "weight_support_tickets": 20,
  "weight_billing_health": 20,
  "weight_engagement_level": 20,
  "weight_renewal_proximity": 15
}
```

### GET /health-score/:accountId
Get account health score details
**Response:**
```json
{
  "account_id": "uuid",
  "overall_score": 78,
  "status": "green",
  "breakdown": {
    "product_usage": { "score": 85, "weight": 25 },
    "support_tickets": { "score": 70, "weight": 20 },
    "billing_health": { "score": 90, "weight": 20 },
    "engagement_level": { "score": 75, "weight": 20 },
    "renewal_proximity": { "score": 70, "weight": 15 }
  },
  "calculated_at": "2024-01-15T10:30:00Z"
}
```

### POST /health-score/:accountId/recalculate
Trigger manual health score recalculation

### GET /health-score/alerts
Get health score alerts
**Query Params:**
- `account_id`
- `severity`
- `is_resolved`

### POST /health-score/alerts/:id/resolve
Resolve health alert

---

## 6. ACTIVITY & TASK MANAGEMENT

### GET /activities
List activities
**Query Params:**
- `account_id`
- `owner_id`
- `activity_type`
- `is_completed`
- `scheduled_from`, `scheduled_to`
- `priority`

### POST /activities
Create new activity
```json
{
  "account_id": "uuid",
  "contact_id": "uuid",
  "activity_type": "meeting",
  "title": "QBR with Acme Corp",
  "summary": "Quarterly business review discussion",
  "scheduled_at": "2024-01-20T14:00:00Z",
  "duration_minutes": 60,
  "priority": "high"
}
```

### GET /activities/:id
Get activity details

### PUT /activities/:id
Update activity

### DELETE /activities/:id
Delete activity

### POST /activities/:id/complete
Mark activity as complete
```json
{
  "outcome": "Successful QBR, renewal confirmed",
  "next_steps": "Send follow-up email with action items"
}
```

### GET /activities/upcoming
Get upcoming activities for current user
**Query Params:**
- `days` (default: 7)

### GET /tasks/my-tasks
Get tasks assigned to current user

---

## 7. RENEWAL MANAGEMENT

### GET /renewals
List all renewals
**Query Params:**
- `stage`
- `risk_level`
- `renewal_date_from`, `renewal_date_to`
- `assigned_csm_id`
- `probability_min`, `probability_max`

### GET /renewals/upcoming
Get upcoming renewals
**Query Params:**
- `days` (30, 60, 90)

### POST /renewals
Create renewal record
```json
{
  "account_id": "uuid",
  "current_arr": 500000,
  "projected_arr": 550000,
  "renewal_date": "2025-01-14",
  "stage": "planning",
  "probability": 80,
  "assigned_csm_id": "uuid"
}
```

### GET /renewals/:id
Get renewal details

### PUT /renewals/:id
Update renewal
```json
{
  "stage": "negotiation",
  "probability": 65,
  "risk_level": "medium",
  "risk_reasons": ["Budget constraints mentioned", "Competitor pricing pressure"],
  "objections": ["Price too high"],
  "notes": "Customer evaluating alternatives"
}
```

### POST /renewals/:id/add-note
Add note to renewal

### GET /renewals/pipeline
Get renewal pipeline summary

---

## 8. ESCALATION MANAGEMENT

### GET /escalations
List escalations
**Query Params:**
- `status`
- `severity`
- `escalation_type`
- `assigned_to`
- `account_id`
- `is_active`

### POST /escalations
Create new escalation
```json
{
  "account_id": "uuid",
  "title": "Critical device connectivity issues",
  "description": "Multiple devices offline affecting production",
  "escalation_type": "technical",
  "severity": "critical",
  "sla_hours": 4,
  "assigned_to": "uuid",
  "customer_impact": "Production line halted",
  "business_impact": "Potential $50K revenue at risk"
}
```

### GET /escalations/:id
Get escalation details with updates

### PUT /escalations/:id
Update escalation

### POST /escalations/:id/updates
Add update to escalation
```json
{
  "update_text": "Engineering team identified root cause",
  "is_internal": false
}
```

### POST /escalations/:id/resolve
Resolve escalation
```json
{
  "resolution_notes": "Issue resolved after firmware update",
  "root_cause": "Firmware bug in version 2.1.3"
}
```

### GET /escalations/:id/war-room
Get war room details

### POST /escalations/:id/war-room
Create war room
```json
{
  "name": "Acme Critical Escalation War Room",
  "participants": ["uuid1", "uuid2", "uuid3"],
  "meeting_link": "https://meet.company.com/room-id",
  "slack_channel": "#war-room-acme"
}
```

### GET /escalations/trends
Get escalation trends
**Query Params:**
- `period` (7d, 30d, 90d, 1y)

---

## 9. EXPANSION TRACKER

### GET /expansion
List expansion opportunities
**Query Params:**
- `stage`
- `opportunity_type`
- `account_id`
- `assigned_csm_id`
- `expected_close_from`, `expected_close_to`

### POST /expansion
Create expansion opportunity
```json
{
  "account_id": "uuid",
  "opportunity_name": "Acme - New Region Expansion",
  "opportunity_type": "new_region",
  "potential_arr": 150000,
  "trigger_type": "new_region",
  "expected_close_date": "2024-06-30",
  "assigned_csm_id": "uuid",
  "assigned_ae_id": "uuid",
  "notes": "Opening new facility in Texas"
}
```

### GET /expansion/:id
Get expansion opportunity details

### PUT /expansion/:id
Update expansion opportunity

### POST /expansion/:id/close-won
Mark as closed won
```json
{
  "actual_arr": 150000,
  "close_notes": "Successfully closed expansion deal"
}
```

### GET /expansion/pipeline
Get expansion pipeline summary

---

## 10. BILLING & CONTRACTS

### GET /contracts
List contracts
**Query Params:**
- `account_id`
- `status`
- `expiring_within_days`

### POST /contracts
Create contract
```json
{
  "account_id": "uuid",
  "contract_number": "CTR-2024-001",
  "contract_type": "master",
  "start_date": "2024-01-15",
  "end_date": "2025-01-14",
  "arr_value": 500000,
  "mrr_value": 41667,
  "pricing_plan": "Enterprise Plus",
  "auto_renewal": true,
  "termination_notice_days": 60
}
```

### GET /contracts/:id
Get contract details

### PUT /contracts/:id
Update contract

### GET /billing/disputes
List billing disputes

### POST /billing/disputes
Create billing dispute
```json
{
  "account_id": "uuid",
  "contract_id": "uuid",
  "dispute_type": "overcharge",
  "amount_disputed": 5000,
  "description": "Charged for 150 devices instead of 125"
}
```

### GET /billing/alerts
Get billing alerts

---

## 11. REPORTING & ANALYTICS

### GET /reports/nrr-grr
Get NRR/GRR trends
**Query Params:**
- `period` (monthly, quarterly, yearly)
- `from_date`, `to_date`

### GET /reports/churn-analysis
Get churn analysis
**Query Params:**
- `period`
- `segment`
- `region`

### GET /reports/expansion-analysis
Get expansion analysis

### GET /reports/health-trends
Get health score trends

### GET /reports/csm-performance
Get CSM performance metrics
**Query Params:**
- `csm_id`
- `period`

### GET /reports/export
Export report
**Query Params:**
- `report_type`
- `format` (pdf, excel, csv)
- `from_date`, `to_date`
- `filters`

---

## 12. AI INSIGHTS & NOTIFICATIONS

### GET /ai-insights
Get AI-generated insights
**Query Params:**
- `account_id`
- `insight_type`
- `is_acknowledged`

### POST /ai-insights/:id/acknowledge
Acknowledge insight

### GET /notifications
Get user notifications
**Query Params:**
- `is_read`
- `limit`

### POST /notifications/:id/read
Mark notification as read

### POST /notifications/mark-all-read
Mark all notifications as read

### GET /notifications/unread-count
Get unread notification count

---

## 13. DOCUMENTS & NOTES

### GET /accounts/:id/documents
Get account documents

### POST /accounts/:id/documents
Upload document
**Form Data:**
- `file` (binary)
- `document_name`
- `document_type`
- `tags`

### DELETE /documents/:id
Delete document

### GET /accounts/:id/notes
Get account notes

### POST /accounts/:id/notes
Add note
```json
{
  "note_type": "strategic",
  "content": "Key strategic initiatives for Q2...",
  "is_pinned": true
}
```

### PUT /notes/:id
Update note

### DELETE /notes/:id
Delete note

---

## ERROR RESPONSES

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

---

## PAGINATION

All list endpoints support pagination:

**Request:**
```
GET /accounts?page=2&limit=50
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 245,
    "total_pages": 5,
    "has_next": true,
    "has_prev": true
  }
}
```

---

## RATE LIMITING

- Standard: 1000 requests/hour
- Bulk operations: 100 requests/hour
- Export: 10 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```
