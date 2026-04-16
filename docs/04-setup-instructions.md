# CS Command Center - Setup Instructions

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd cs-command-center

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb cs_command_center

# Run migrations
psql cs_command_center < docs/01-database-schema.sql
```

### 3. Environment Configuration

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cs_command_center

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000/api/v1
```

### 4. Start Development Server

```bash
# Start backend
npm run server

# Start frontend (in another terminal)
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/v1

---

## Production Deployment

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend (Vercel)

1. Push code to GitHub
2. Connect Vercel to your repository
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
# Build for production
npm run build
```

#### Backend (Railway)

1. Create new project on Railway
2. Add PostgreSQL plugin
3. Deploy from GitHub
4. Set environment variables

### Option 2: AWS Deployment

#### Using ECS + RDS

```bash
# Build Docker image
docker build -t cs-command-center .

# Push to ECR
docker tag cs-command-center:latest <account>.dkr.ecr.<region>.amazonaws.com/cs-command-center:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/cs-command-center:latest

# Deploy using ECS
```

### Option 3: Docker Compose (Self-Hosted)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/cs_command_center
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cs_command_center
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for JWT signing | `super-secret-key` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `LOG_LEVEL` | Logging level | `info` |

---

## Database Migrations

### Creating Migrations

```bash
# Using knex
npx knex migrate:make migration_name

# Run migrations
npx knex migrate:latest

# Rollback
npx knex migrate:rollback
```

### Seed Data

```bash
# Run seeds
npx knex seed:run
```

---

## Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

---

## Troubleshooting

### Common Issues

#### Database Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Ensure PostgreSQL is running
- Check DATABASE_URL credentials
- Verify database exists

#### JWT Errors

```
Error: invalid signature
```

**Solution:**
- Verify JWT_SECRET is set
- Check token hasn't expired
- Ensure same secret on all services

#### CORS Errors

```
Access to fetch at '...' from origin '...' has been blocked
```

**Solution:**
- Set CORS_ORIGIN to your frontend URL
- Or use proxy in development

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] Set secure CORS origins
- [ ] Use strong database passwords
- [ ] Enable request rate limiting
- [ ] Set up logging and monitoring
- [ ] Regular security updates

---

## Support

For issues and feature requests, please create a GitHub issue.
