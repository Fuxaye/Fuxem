# VPS Deployment Guide for Fuxem

This document explains how to install and run Fuxem on an Ubuntu VPS using Node.js, PostgreSQL, Nginx, and PM2.

## Server requirements

- Ubuntu 24.04 LTS or Debian 12/13
- At least 2 CPUs, 4 GB RAM for a small production deployment
- Open ports: 22, 80, 443

## Recommended production stack

- Node.js 20.x
- npm 10+
- PostgreSQL 16+ (or managed Postgres)
- Nginx
- PM2 or systemd
- Certbot for TLS

## Pre-deploy checklist

1. Point your domain to the VPS public IP.
2. Create a PostgreSQL database and user.
3. Provision SMTP credentials.
4. Create a LiveKit project if you want on-site recording.
5. Create a Supabase project if you want Supabase storage.

## Deploy steps

### 1. Install system dependencies

```bash
sudo apt update
sudo apt install -y curl git nginx certbot python3-certbot-nginx build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Clone the repo

```bash
cd /var/www
sudo git clone https://github.com/Fuxaye/Fuxem.git fuxem
cd fuxem
sudo npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with production values.
```

### 4. Build the app

```bash
npm run build:vps
```

### 5. Configure PostgreSQL

If you are using self-hosted Postgres:

```bash
sudo apt install -y postgresql
sudo -u postgres psql
CREATE DATABASE fuxem;
CREATE USER fuxem_user WITH PASSWORD 'strongpassword';
GRANT ALL PRIVILEGES ON DATABASE fuxem TO fuxem_user;
\q
```

Update `DATABASE_URL` in `.env` with the database connection string.

### 6. Run Prisma migrations

```bash
npm run db:deploy
```

### 7. Configure Nginx

Create `/etc/nginx/sites-available/fuxem` with the proxy config.

```nginx
server {
    listen 80;
    server_name fuxem.com www.fuxem.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/fuxem /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Enable HTTPS

```bash
sudo certbot --nginx -d fuxem.com -d www.fuxem.com
```

### 9. Start the app with PM2

```bash
sudo npm install -g pm2
pm2 start npm --name fuxem -- start
pm2 save
sudo pm2 startup
```

### 10. Smoke test

- Visit `https://fuxem.com`
- Sign up, log in, and verify `/camera` renders
- Upload a photo/video and check it persists

## Notes

- Keep `.env` secret.
- Use a managed Postgres for reliability if possible.
- For local storage replacement, the app currently expects Supabase storage.
- LiveKit credentials are required for camera tokens.

## Free VPS analytics

You can set up no-cost traffic analytics from Nginx logs using GoAccess.

1. Pull latest changes on VPS.
2. Run: `sudo bash deploy/setup-free-analytics.sh <your-domain>`
3. Open: `https://<your-domain>/analytics/`

Detailed runbook: `docs/VPS-FREE-ANALYTICS.md`
Nginx location snippet: `deploy/nginx-fuxem-analytics-snippet.conf`
