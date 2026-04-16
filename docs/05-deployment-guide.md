# CS Command Center - Deployment Guide

## Overview

This guide covers deploying CS Command Center to various cloud platforms.

---

## Option 1: Vercel (Recommended for Frontend)

### Prerequisites
- Vercel account
- GitHub repository with your code

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Add New Project"
- Import your GitHub repository
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

3. **Environment Variables**
Add in Vercel dashboard:
```
VITE_API_URL=https://your-api-domain.com/api/v1
```

4. **Deploy**
Click "Deploy" and wait for build to complete.

---

## Option 2: Netlify

### Steps

1. **Build Settings**
- Build command: `npm run build`
- Publish directory: `dist`

2. **Environment Variables**
Add in Netlify dashboard:
```
VITE_API_URL=https://your-api-domain.com/api/v1
```

3. **Deploy**
Connect GitHub repo and deploy.

---

## Option 3: AWS S3 + CloudFront

### Using AWS CLI

```bash
# Build the app
npm run build

# Create S3 bucket
aws s3 mb s3://cs-command-center-frontend

# Enable static website hosting
aws s3 website s3://cs-command-center-frontend --index-document index.html --error-document index.html

# Upload files
aws s3 sync dist/ s3://cs-command-center-frontend --delete

# Set bucket policy for public read
aws s3api put-bucket-policy --bucket cs-command-center-frontend --policy file://bucket-policy.json
```

### CloudFront Distribution

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name cs-command-center-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

---

## Option 4: Backend Deployment (Node.js/Express)

### Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy

### Render

1. Create account at [render.com](https://render.com)
2. New Web Service
3. Connect GitHub repository
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add PostgreSQL database
6. Set environment variables
7. Deploy

### Heroku

```bash
# Login
heroku login

# Create app
heroku create cs-command-center-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set config vars
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

---

## Option 5: Full-Stack Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose (Production)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/cs_command_center
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=cs_command_center
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker Compose

```bash
# Create .env file
cat > .env << EOF
DB_PASSWORD=secure-password
JWT_SECRET=your-jwt-secret
EOF

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        root /var/www/cs-command-center/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Monitoring & Logging

### Application Monitoring

```bash
# Using PM2
npm install -g pm2
pm2 start server/index.js --name cs-command-center
pm2 save
pm2 startup

# View logs
pm2 logs

# Monitor
pm2 monit
```

### Health Checks

Add to your deployment:
```bash
# Health check endpoint
curl https://your-domain.com/api/health
```

---

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Automated Backups (AWS)

```bash
# Using AWS Backup
aws backup create-backup-plan --backup-plan file://backup-plan.json
```

---

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

  redis:
    image: redis:alpine

  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Load Balancing

```nginx
upstream backend {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] Database connections working
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] SSL certificate valid
- [ ] Environment variables set
- [ ] Logging configured
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Documentation updated

---

## Rollback Strategy

```bash
# Using Git
git log --oneline
git revert <commit-hash>

# Using Docker
docker-compose pull
docker-compose up -d

# Using PM2
pm2 reload all
```
