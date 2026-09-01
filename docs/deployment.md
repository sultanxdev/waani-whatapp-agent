# Production Deployment Guide

## 1. Prerequisites
- Node.js v20+ or Docker
- A public domain with SSL / HTTPS (e.g. via Cloudflare)
- Meta Business Account with WhatsApp Cloud API access
- PostgreSQL database (or persistent volume for default storage)

## 2. Docker Deployment (Recommended)
1. Clone the repository to the server:
   ```bash
   git clone <repo-url> /opt/derma-whatsapp-agent
   cd /opt/derma-whatsapp-agent
   ```
2. Copy and populate `.env`:
   ```bash
   cp .env.example .env
   nano .env
   ```
3. Start container with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
4. Verify health check:
   ```bash
   curl http://localhost:4000/health
   ```

## 3. Native Node.js Deployment
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build frontend:
   ```bash
   npm --workspace=apps/web run build
   ```
3. Run Database Seed:
   ```bash
   npm run seed
   ```
4. Start production server via PM2:
   ```bash
   pm2 start apps/api/src/server.js --name "derma-api"
   ```

## 4. Reverse Proxy (Nginx / Cloudflare)
Configure Nginx with SSL proxying port `4000`:

```nginx
server {
    server_name clinic.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
