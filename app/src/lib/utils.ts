import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(value: number, options: { compact?: boolean; decimals?: number } = {}): string {
  const { compact = false, decimals = 0 } = options;
  
  if (compact && value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (compact && value >= 1000) {
    return `$${(value / 1000).toFixed(decimals)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format number with commas
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

// Format date
export function formatDate(date: string | Date, options: { relative?: boolean } = {}): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const { relative = false } = options;
  
  if (relative) {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format date time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Get relative time
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) return 'just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return formatDate(date);
}

// Get days until date
export function getDaysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

// Get health score color
export function getHealthScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 70) {
    return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-500' };
  }
  if (score >= 40) {
    return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-500' };
  }
  return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500' };
}

// Get health score status
export function getHealthScoreStatus(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

// Get severity color
export function getSeverityColor(severity: string): { bg: string; text: string; dot: string; border: string } {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-500' };
    case 'high':
      return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-500' };
    case 'medium':
      return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-500' };
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-500' };
  }
}

// Get activity type icon
export function getActivityTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    call: 'Phone',
    meeting: 'Users',
    email: 'Mail',
    follow_up: 'ArrowRight',
    internal_discussion: 'MessageSquare',
    qbr: 'Presentation',
    escalation: 'AlertTriangle',
    note: 'FileText',
    task: 'CheckSquare',
  };
  return icons[type] || 'Circle';
}

// Get activity type label
export function getActivityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    call: 'Call',
    meeting: 'Meeting',
    email: 'Email',
    follow_up: 'Follow-up',
    internal_discussion: 'Internal Discussion',
    qbr: 'QBR',
    escalation: 'Escalation',
    note: 'Note',
    task: 'Task',
  };
  return labels[type] || type;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Get renewal stage label
export function getRenewalStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    planning: 'Planning',
    negotiation: 'Negotiation',
    closing: 'Closing',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
    at_risk: 'At Risk',
  };
  return labels[stage] || stage;
}

// Get opportunity stage label
export function getOpportunityStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    identified: 'Identified',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
    on_hold: 'On Hold',
  };
  return labels[stage] || stage;
}

// Get escalation status label
export function getEscalationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    pending_customer: 'Pending Customer',
    pending_internal: 'Pending Internal',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return labels[status] || status;
}

// Calculate trend
export function calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } {
  const diff = current - previous;
  const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;
  return {
    value: Math.abs(percentChange),
    isPositive: diff >= 0,
  };
}
