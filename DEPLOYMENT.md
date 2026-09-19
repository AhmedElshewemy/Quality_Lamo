# 🚀 Production Deployment Guide

## نظرة عامة

هذا الدليل يشرح كيفية نشر نظام إدارة الجودة في بيئة الإنتاج.

---

## 📋 المتطلبات

### Frontend:
- Node.js 18+
- npm أو yarn

### Backend (اختياري - للنشر الكامل):
- Node.js 18+
- SQLite3

### Hosting Options:
1. **Vercel** (Frontend) + **Railway/Render** (Backend)
2. **AWS** (EC2 + S3 + RDS)
3. **DigitalOcean** (App Platform)
4. **Firebase** (Hosting + Functions)
5. **Docker** (Self-hosted)

---

## 🔧 الإعداد للإنتاج

### 1. Environment Variables

أنشئ ملف `.env.production`:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Backend API (if using)
REACT_APP_API_URL=https://api.yourdomain.com

# Environment
NODE_ENV=production
```

### 2. Build for Production

```bash
npm run build
```

الملفات ستكون في مجلد `dist/`

---

## 🌐 خيارات النشر

### Option 1: Vercel (الأسهل)

#### Frontend on Vercel:

1. ارفع المشروع على GitHub
2. اذهب إلى [vercel.com](https://vercel.com)
3. اضغط "New Project"
4. اختر repository
5. أضف Environment Variables
6. اضغط "Deploy"

**المميزات:**
- ✅ مجاني
- ✅ HTTPS تلقائي
- ✅ CDN عالمي
- ✅ Deploy تلقائي من Git

---

### Option 2: Firebase Hosting + Functions

#### Frontend on Firebase:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

اختر:
- Public directory: `dist`
- Single-page app: Yes
- GitHub deploys: No

```bash
npm run build
firebase deploy
```

#### Backend on Firebase Functions:

```bash
firebase init functions
```

انقل `server/index.js` إلى `functions/index.js`

```bash
firebase deploy --only functions
```

---

### Option 3: Docker Deployment

#### Dockerfile:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

EXPOSE 3001

CMD ["node", "server/index.js"]
```

#### docker-compose.yml:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secret-key
      - REACT_APP_FIREBASE_API_KEY=${FIREBASE_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

#### Build and Run:

```bash
docker-compose up -d
```

---

### Option 4: AWS Deployment

#### Using EC2 + S3:

1. **Frontend on S3:**
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

2. **Backend on EC2:**
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup
git clone your-repo
cd your-repo/server
npm install --production
pm2 start index.js --name "seafood-qms"
```

---

### Option 5: DigitalOcean App Platform

1. ارفع على GitHub
2. اذهب إلى DigitalOcean
3. Create App
4. اختر repository
5. Configure:
   - Build Command: `npm run build`
   - Run Command: `node server/index.js`
6. Add Environment Variables
7. Deploy

---

## 🔐 الأمان في الإنتاج

### 1. HTTPS
كل الـ hosting providers بيوفروا HTTPS تلقائي.

### 2. Environment Variables
**لا ترفع `.env` على Git!**

أضف في `.gitignore`:
```
.env
.env.local
.env.production
```

### 3. Security Headers
في `server/index.js`:
```javascript
app.use(helmet());
```

### 4. Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);
```

### 5. Input Validation
استخدم Zod للـ validation (موجود بالفعل في المشروع).

### 6. SQL Injection Protection
استخدم parameterized queries (مطبق في الـ Repository Layer).

---

## 📊 Monitoring & Logging

### 1. Application Monitoring

#### Sentry (Error Tracking):
```bash
npm install @sentry/react @sentry/tracing
```

```javascript
// src/index.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

#### Firebase Analytics:
```bash
npm install firebase/analytics
```

### 2. Server Monitoring

#### PM2 (Node.js Process Manager):
```bash
npm install -g pm2
pm2 start server/index.js --name "seafood-qms"
pm2 startup
pm2 save
```

#### Logs:
```bash
pm2 logs seafood-qms
```

---

## 💾 Backup Strategy

### SQLite Database Backup:

#### Automated Backup Script:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/seafood-qms"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="seafood_qms.db"

mkdir -p $BACKUP_DIR

# Backup database
sqlite3 $DB_FILE ".backup '$BACKUP_DIR/backup_$DATE.db'"

# Compress
gzip $BACKUP_DIR/backup_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.db.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.db.gz"
```

#### Cron Job:
```bash
# Backup every day at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... other env vars
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📈 Performance Optimization

### 1. Code Splitting
```javascript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
```

### 2. Image Optimization
- استخدم WebP format
- Compress images قبل الرفع
- Lazy load images

### 3. Caching
```javascript
// Cache API responses
const cache = new Map();

const getCachedData = async (key, fetcher) => {
  if (cache.has(key)) return cache.get(key);
  const data = await fetcher();
  cache.set(key, data);
  return data;
};
```

### 4. CDN
استخدم CDN للـ static assets:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network

---

## 🧪 Testing in Production

### 1. Health Checks
```javascript
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});
```

### 2. Monitoring Endpoints
```javascript
app.get('/api/metrics', authenticateToken, (req, res) => {
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };
  res.json(metrics);
});
```

---

## 🚨 Incident Response

### 1. Monitoring Alerts
- Set up alerts for:
  - High error rates
  - Slow response times
  - Database connection issues
  - High memory usage

### 2. Rollback Plan
```bash
# If using Vercel
vercel rollback

# If using Docker
docker-compose down
docker-compose up -d --build
```

### 3. Emergency Contacts
- DevOps Team: devops@company.com
- On-call Engineer: +1234567890
- Support: support@company.com

---

## 📝 Checklist قبل الـ Deployment

### Frontend:
- [ ] Build ناجح بدون errors
- [ ] Environment variables مضبوطة
- [ ] HTTPS مفعّل
- [ ] Error boundaries مضافة
- [ ] Performance monitoring مفعّل
- [ ] Analytics مفعّل

### Backend:
- [ ] Database migrations مطبقة
- [ ] Security headers مضافة
- [ ] Rate limiting مفعّل
- [ ] Input validation مفعّل
- [ ] Error logging مفعّل
- [ ] Backup strategy مطبق
- [ ] Health checks مضافة

### Infrastructure:
- [ ] SSL certificate مفعّل
- [ ] Firewall rules مضبوطة
- [ ] Monitoring tools مثبتة
- [ ] Backup automation مطبق
- [ ] CI/CD pipeline شغال
- [ ] Documentation محدثة

---

## 🆘 الدعم والمساعدة

### Documentation:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - معمارية النظام
- [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) - دليل قاعدة البيانات
- [README.md](./README.md) - دليل الاستخدام

### Contact:
- Email: support@seafood-qms.com
- Phone: +20 123 456 7890

---

**آخر تحديث:** 2024  
**الإصدار:** 1.0.0
