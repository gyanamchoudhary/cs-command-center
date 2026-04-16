# CS Command Center - UI/UX Design Document

## Design Philosophy

**Inspired by:** Notion + HubSpot + Linear

**Core Principles:**
- Clean, minimal interface with focus on content
- Consistent spacing and typography
- Clear visual hierarchy
- Fast, intuitive navigation
- Data-dense but not overwhelming
- Action-oriented design

---

## Color Palette

### Primary Colors
```
--primary-50: #eff6ff
--primary-100: #dbeafe
--primary-200: #bfdbfe
--primary-300: #93c5fd
--primary-400: #60a5fa
--primary-500: #3b82f6
--primary-600: #2563eb
--primary-700: #1d4ed8
--primary-800: #1e40af
--primary-900: #1e3a8a
```

### Semantic Colors
```
--success: #10b981 (Green)
--warning: #f59e0b (Amber)
--danger: #ef4444 (Red)
--info: #3b82f6 (Blue)
```

### Health Status Colors
```
--health-green: #10b981
--health-green-bg: #d1fae5
--health-yellow: #f59e0b
--health-yellow-bg: #fef3c7
--health-red: #ef4444
--health-red-bg: #fee2e2
```

### Neutral Colors
```
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

### Background Colors
```
--bg-primary: #ffffff
--bg-secondary: #f9fafb
--bg-tertiary: #f3f4f6
```

---

## Typography

### Font Family
```
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', monospace
```

### Type Scale
```
--text-xs: 0.75rem (12px)     - Labels, badges
--text-sm: 0.875rem (14px)    - Secondary text, captions
--text-base: 1rem (16px)      - Body text
--text-lg: 1.125rem (18px)    - Lead text
--text-xl: 1.25rem (20px)     - Card titles
--text-2xl: 1.5rem (24px)     - Section headers
--text-3xl: 1.875rem (30px)   - Page titles
--text-4xl: 2.25rem (36px)    - Dashboard numbers
```

### Font Weights
```
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

---

## Spacing System

```
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-5: 1.25rem (20px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-10: 2.5rem (40px)
--space-12: 3rem (48px)
```

---

## Border Radius

```
--radius-sm: 0.25rem (4px)
--radius-md: 0.375rem (6px)
--radius-lg: 0.5rem (8px)
--radius-xl: 0.75rem (12px)
--radius-2xl: 1rem (16px)
--radius-full: 9999px
```

---

## Shadows

```
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

---

## Layout Structure

### Main Layout
```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (64px collapsed, 240px expanded)              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Header (64px)                                  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │                                                 │   │
│  │  Main Content Area                              │   │
│  │  (Scrollable)                                   │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Sidebar Navigation
```
Logo (collapsed: icon only, expanded: icon + text)
├── Dashboard
├── Accounts
├── Activities
├── Renewals
├── Escalations
├── Expansion
├── Billing
├── Reports
├── Settings
└── User Profile (bottom)
```

---

## Component Specifications

### 1. KPI Cards (Dashboard)
```
┌────────────────────────────────┐
│  Icon  Title                   │
│        ┌────────────────────┐  │
│        │ $12.5M             │  │
│        │ ↑ 15.3% vs last mo │  │
│        └────────────────────┘  │
└────────────────────────────────┘

Size: Flexible (min 240px)
Padding: 24px
Background: White
Border: 1px solid gray-200
Border Radius: 12px
Shadow: shadow-sm
```

### 2. Health Score Badge
```
Green:  
┌────────┐
│ ● 85   │  (bg: green-100, text: green-800)
└────────┘

Yellow:
┌────────┐
│ ● 65   │  (bg: yellow-100, text: yellow-800)
└────────┘

Red:
┌────────┐
│ ● 35   │  (bg: red-100, text: red-800)
└────────┘

Size: 32px height
Padding: 4px 12px
Border Radius: full
Font: 14px semibold
```

### 3. Account Row (List View)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] Account Name    Health    ARR      CSM    Region  Status │
│        Acme Corp       ● 85      $500K   John    NA      Active │
└─────────────────────────────────────────────────────────────────┘

Height: 64px
Padding: 16px 24px
Hover: bg-gray-50
Border Bottom: 1px solid gray-200
```

### 4. Activity Timeline Item
```
┌────────────────────────────────────────────────────────────┐
│  ●───────────                                              │
│  │  [Icon]  Meeting with Acme Corp                         │
│  │         Yesterday at 2:00 PM • John Doe                 │
│  │         Quarterly business review...                    │
│  │                                                         │
│  ●───────────                                              │
│  │  [Icon]  Email sent                                     │
│  │         Jan 15, 2024 • Jane Smith                       │
│  │         Follow-up on support ticket...                  │
└────────────────────────────────────────────────────────────┘

Timeline line: 2px, gray-300
Dot: 12px, primary-500
Padding: 16px 0
```

### 5. Escalation Card
```
┌────────────────────────────────────────────────────────────┐
│  🔴 CRITICAL          Technical        Open 2h ago         │
│  Device connectivity issues at Acme Corp                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Assigned: John Doe    SLA: 2h remaining                   │
│  [View Details]  [Update]  [Resolve]                       │
└────────────────────────────────────────────────────────────┘

Background: White
Border Left: 4px solid (severity color)
Padding: 20px
Border Radius: 8px
Shadow: shadow-md
```

### 6. Data Table
```
┌─────────────────────────────────────────────────────────────────┐
│  [Search...]                    [Filter ▼]  [Export ▼] [+ New] │
├─────────────────────────────────────────────────────────────────┤
│  □  Account Name    Health    ARR      CSM    Region   Actions │
├─────────────────────────────────────────────────────────────────┤
│  □  Acme Corp       ● 85      $500K   John    NA      [⋯]     │
│  □  TechStart Inc   ● 72      $250K   Sarah   EU      [⋯]     │
│  □  Global Systems  ● 45      $1.2M   Mike    APAC    [⋯]     │
├─────────────────────────────────────────────────────────────────┤
│  Showing 1-10 of 245    [<] 1 2 3 ... 25 [>]                  │
└─────────────────────────────────────────────────────────────────┘

Header: bg-gray-50, font-semibold
Row Height: 56px
Row Hover: bg-gray-50
Border: 1px solid gray-200
Border Radius: 8px
```

### 7. Modal/Dialog
```
┌────────────────────────────────────────┐
│  Create New Activity              [×]  │
├────────────────────────────────────────┤
│                                        │
│  Account *                             │
│  ┌────────────────────────────────┐    │
│  │ Search accounts...             │    │
│  └────────────────────────────────┘    │
│                                        │
│  Activity Type *                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │Call│ │Meet│ │Email│ │Task│          │
│  └────┘ └────┘ └────┘ └────┘          │
│                                        │
│  Title *                               │
│  ┌────────────────────────────────┐    │
│  │                                │    │
│  └────────────────────────────────┘    │
│                                        │
│  ┌────────────────┐  ┌────────────────┐│
│  │   Cancel       │  │    Create      ││
│  └────────────────┘  └────────────────┘│
└────────────────────────────────────────┘

Width: 560px (standard), 720px (large)
Padding: 24px
Background: White
Border Radius: 12px
Shadow: shadow-xl
Overlay: bg-black/50
```

---

## Page Specifications

### 1. Dashboard / Command Center

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                                      [Filter ▼]      │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ Total  │ │  NRR   │ │  GRR   │ │ Active │ │ At Risk│        │
│  │ $12.5M │ │ 115.5% │ │ 92.3%  │ │  245   │ │   18   │        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐        │
│  │  Health Distribution   │  │  Upcoming Renewals     │        │
│  │  [Donut Chart]         │  │  [Bar Chart]           │        │
│  │                        │  │                        │        │
│  │  ● Green: 189          │  │  30 days: 12           │        │
│  │  ● Yellow: 38          │  │  60 days: 28           │        │
│  │  ● Red: 18             │  │  90 days: 45           │        │
│  └────────────────────────┘  └────────────────────────┘        │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐        │
│  │  Recent Activities     │  │  Active Escalations    │        │
│  │  ─────────────────     │  │  ─────────────────     │        │
│  │  [Timeline items]      │  │  [Escalation cards]    │        │
│  │                        │  │                        │        │
│  └────────────────────────┘  └────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- KPI Cards (5 metrics)
- Health Distribution Chart (Donut)
- Upcoming Renewals Chart (Bar)
- Recent Activities List
- Active Escalations List
- AI Insights Banner

---

### 2. Account 360° Profile

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back]  Acme Corporation                    [Edit] [Actions] │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Logo]  Acme Corporation              Health: ● 85     │   │
│  │          Manufacturing • Enterprise    Status: Active   │   │
│  │          Primary CSM: John Doe         ARR: $500K       │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Overview | Health Score | Activities | Escalations | Billing  │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐        │
│  │  ACCOUNT DETAILS       │  │  KEY CONTACTS          │        │
│  │  ─────────────────     │  │  ─────────────────     │        │
│  │  Industry: Mfg         │  │  • Jane Smith (VP)     │        │
│  │  Size: 1000-5000       │  │  • Bob Johnson (CTO)   │        │
│  │  Region: NA            │  │                        │        │
│  │  Renewal: Jan 14, 2025 │  │  [+ Add Contact]       │        │
│  │                        │  │                        │        │
│  │  DEVICES               │  │  UPCOMING ACTIVITIES   │        │
│  │  ─────────────────     │  │  ─────────────────     │        │
│  │  Deployed: 1,250       │  │  • QBR (Jan 20)        │        │
│  │  Active: 1,198         │  │  • Renewal Call (Feb)  │        │
│  │  [View Details]        │  │                        │        │
│  └────────────────────────┘  └────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

**Tabs:**
1. **Overview** - Account details, contacts, devices, upcoming activities
2. **Health Score** - Score breakdown, trends, alerts
3. **Activities** - Full activity timeline with filters
4. **Escalations** - Active and resolved escalations
5. **Billing** - Contracts, invoices, disputes

---

### 3. Escalations List

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Escalations    [+ New Escalation]                              │
├─────────────────────────────────────────────────────────────────┤
│  [All] [Open] [In Progress] [Critical] [My Escalations]        │
├─────────────────────────────────────────────────────────────────┤
│  [Search...]  [Type ▼] [Severity ▼] [Account ▼]  [Filter]      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔴 CRITICAL  Technical  Open 2h ago              [⋯]    │   │
│  │ Device connectivity issues at Acme Corp                 │   │
│  │ Assigned: John Doe  |  SLA: 2h remaining                │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🟠 HIGH  Billing  Open 1d ago                    [⋯]    │   │
│  │ Invoice dispute - overcharge claim                      │   │
│  │ Assigned: Sarah Smith  |  SLA: 12h remaining            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. Renewal Pipeline

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Renewal Pipeline                                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │  Planning   │ │ Negotiation │ │   Closing   │ │Closed Won  ││
│  │    (12)     │ │    (8)      │ │    (5)      │ │   (45)     ││
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├────────────┤│
│  │ Acme Corp   │ │ TechStart   │ │ GlobalSys   │ │ MegaCorp   ││
│  │ $500K • 80% │ │ $250K • 60% │ │ $1.2M • 90% │ │ $2M ✓      ││
│  │ Due: 30d    │ │ Due: 45d    │ │ Due: 15d    │ │ Jan 2024   ││
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├────────────┤│
│  │ [+ Add]     │ │ [+ Add]     │ │ [+ Add]     │ │            ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: 1024px - 1440px
Large Desktop: > 1440px
```

### Mobile Adaptations
- Sidebar becomes bottom navigation
- Tables become cards
- KPIs stack vertically
- Modals become full-screen
- Filters collapse into drawer

---

## Animation Specifications

### Transitions
```css
--transition-fast: 150ms ease
--transition-base: 250ms ease
--transition-slow: 350ms ease
```

### Micro-interactions
- Button hover: scale(1.02), 150ms
- Card hover: translateY(-2px), shadow increase, 200ms
- Modal open: opacity 0→1, scale 0.95→1, 250ms
- Toast notification: slide in from right, 300ms
- Page transition: fade, 200ms

---

## Iconography

**Icon Library:** Lucide React
**Icon Size:** 20px (default), 16px (small), 24px (large)
**Icon Stroke Width:** 2px

### Common Icons
- Dashboard: LayoutDashboard
- Accounts: Building2
- Activities: CalendarClock
- Renewals: RefreshCw
- Escalations: AlertTriangle
- Expansion: TrendingUp
- Billing: CreditCard
- Reports: BarChart3
- Settings: Settings
- Search: Search
- Filter: Filter
- More: MoreHorizontal
- Edit: Pencil
- Delete: Trash2
- Add: Plus
- Close: X
- Check: Check
- Alert: AlertCircle
