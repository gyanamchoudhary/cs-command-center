# CS Command Center

A modern, enterprise-grade Customer Success platform built with React, TypeScript, and Tailwind CSS.

![CS Command Center](https://img.shields.io/badge/CS-Command%20Center-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-06B6D4?logo=tailwindcss)

## Features

### Core Modules

- **Dashboard** - Overview of key metrics, health distribution, renewal timeline, active escalations, and AI insights
- **Accounts** - Complete account management with health scores, CSM assignment, and activity tracking
- **Activities** - Log and track all customer interactions (calls, meetings, emails, tasks)
- **Renewals** - Pipeline management with stage tracking, probability scoring, and risk assessment
- **Escalations** - Critical issue tracking with SLA management and severity classification
- **Expansion** - Upsell and cross-sell opportunity tracking
- **Reports** - Performance analytics and reporting for CSMs and management
- **Settings** - User profile, health score configuration, notifications, and team management

### Key Capabilities

- **Role-Based Access Control (RBAC)** - Admin and User roles with permission-based data visibility
- **Real-time Data** - Live updates across all modules
- **SLA Tracking** - Visual progress bars and breach warnings for escalations
- **Health Scoring** - Configurable health score calculation with weighted factors
- **Activity Logging** - Complete audit trail of all customer interactions
- **Pipeline Management** - Track opportunities through various stages

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **State Management**: React Context API
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-github-repo-url>
cd cs-command-center
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Login Credentials

The application uses sample data for demonstration purposes:

**Admin User:**
- Email: `sarah.johnson@cscommand.com`
- Password: (any non-empty password works for demo)

**Regular Users:**
- Email: `mike.chen@cscommand.com`
- Email: `emma.davis@cscommand.com`

## Project Structure

```
src/
├── components/
│   ├── dashboard/       # Dashboard-specific components
│   ├── layout/          # Layout components (Sidebar, Header)
│   ├── permissions/     # Permission-based components
│   ├── shared/          # Shared UI components
│   └── ui/              # shadcn/ui components
├── data/
│   └── sampleData.ts    # Sample data for demo
├── hooks/
│   ├── useAuth.tsx      # Authentication context
│   ├── useAccounts.tsx  # Accounts context
│   ├── useActivities.tsx # Activities context
│   └── ...
├── lib/
│   ├── api.ts           # API layer with permission filtering
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # TypeScript type definitions
├── views/
│   ├── Dashboard.tsx
│   ├── Accounts.tsx
│   ├── Activities.tsx
│   ├── Renewals.tsx
│   ├── Escalations.tsx
│   ├── Expansion.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   └── Login.tsx
├── App.tsx
└── main.tsx
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Permission System

The application implements a comprehensive RBAC system:

- **Admin Users**: Full access to all data and functionality
- **Regular Users (CSMs)**: Only see data for their assigned accounts

Data visibility is enforced at the API layer, not just in the UI.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ for Customer Success teams.
