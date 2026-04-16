# CS Command Center

An enterprise-grade Customer Success platform for tracking, managing, and optimizing customer lifecycle, revenue, health, escalations, and insights.

![CS Command Center](https://img.shields.io/badge/CS%20Command%20Center-v1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?logo=tailwindcss)

## Features

### Core Modules

- **Dashboard / Command Center** - Real-time overview of KPIs, health distribution, renewals, and escalations
- **Account Management** - 360° customer profiles with contacts, activities, and history
- **Health Score Engine** - Configurable scoring model with AI-powered insights
- **Task & Activity Tracker** - Log and track all customer interactions
- **Renewal Management** - Pipeline tracking with risk assessment and probability scoring
- **Escalation Management** - War room tracking with SLA monitoring
- **Expansion Tracker** - Upsell/cross-sell opportunity management
- **Billing & Contracts** - Contract lifecycle and billing dispute management
- **Reporting & Analytics** - Comprehensive dashboards and exportable reports
- **User Roles & Permissions** - Role-based access control

### Advanced Features

- AI-powered insights and recommendations
- Real-time notifications and alerts
- Configurable health score weights
- Mobile-responsive design
- Export to PDF/Excel
- Integration-ready architecture

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS + shadcn/ui
- Recharts (Data visualization)
- Lucide React (Icons)

### Backend (Architecture)
- Node.js + Express
- PostgreSQL (Database)
- JWT Authentication
- RESTful API

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd cs-command-center

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## Project Structure

```
cs-command-center/
├── docs/                       # Documentation
│   ├── 01-database-schema.sql  # PostgreSQL schema
│   ├── 02-api-structure.md     # API documentation
│   ├── 03-ui-ux-design.md      # Design guidelines
│   ├── 04-setup-instructions.md
│   └── 05-deployment-guide.md
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard components
│   │   ├── layout/             # Layout components
│   │   ├── shared/             # Shared components
│   │   └── ui/                 # shadcn/ui components
│   ├── views/                  # Page views
│   ├── data/                   # Sample data
│   ├── types/                  # TypeScript types
│   └── lib/                    # Utilities
└── public/                     # Static assets
```

## Screenshots

### Dashboard
The Command Center provides a comprehensive overview of all key metrics including ARR, NRR, GRR, health distribution, upcoming renewals, and active escalations.

### Account 360° Profile
View complete customer profiles with health scores, activity timeline, contacts, contracts, and escalations in a single unified interface.

### Renewal Pipeline
Track renewals through the pipeline with probability scoring, risk assessment, and stakeholder engagement tracking.

### Escalation Management
Manage critical customer issues with SLA tracking, war rooms, and resolution workflows.

## API Documentation

See [02-api-structure.md](docs/02-api-structure.md) for complete API documentation.

### Authentication
```
POST /api/v1/auth/login
Authorization: Bearer <token>
```

### Key Endpoints
- `GET /api/v1/dashboard/metrics` - Dashboard KPIs
- `GET /api/v1/accounts` - List accounts
- `GET /api/v1/escalations` - List escalations
- `GET /api/v1/renewals` - List renewals
- `GET /api/v1/health-score/:id` - Account health score

## Database Schema

The PostgreSQL schema includes tables for:
- Users & Permissions
- Accounts & Contacts
- Health Scores & Alerts
- Activities & Tasks
- Renewals & Expansion
- Escalations & War Rooms
- Contracts & Billing
- AI Insights & Notifications

See [01-database-schema.sql](docs/01-database-schema.sql) for complete schema.

## Deployment

### Option 1: Vercel (Frontend)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Option 2: Docker
```bash
docker-compose up -d
```

See [05-deployment-guide.md](docs/05-deployment-guide.md) for detailed deployment options.

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cs_command_center

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# API
PORT=3000
NODE_ENV=production
```

## User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full access to all features |
| CSM | Manage accounts, activities, renewals |
| CS Ops | Read-only + operational tasks |
| Viewer | Read-only dashboard access |

## Health Score Configuration

Default weights:
- Product Usage: 25%
- Support Tickets: 20%
- Billing Health: 20%
- Engagement Level: 20%
- Renewal Proximity: 15%

Configure in Settings > Health Score.

## Roadmap

- [ ] AI-powered churn prediction
- [ ] Advanced analytics with ML
- [ ] Mobile app (React Native)
- [ ] Salesforce/HubSpot integrations
- [ ] Custom report builder
- [ ] API webhooks
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: `/docs` folder
- Issues: GitHub Issues
- Email: support@cscommandcenter.io

---

Built with by the Customer Success Team
