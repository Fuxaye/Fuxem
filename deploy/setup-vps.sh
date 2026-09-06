#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/fuxem}"
APP_REPO="${APP_REPO:-https://github.com/Fuxaye/Fuxem.git}"
APP_BRANCH="${APP_BRANCH:-main}"
DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-admin@${DOMAIN:-example.com}}"
DB_NAME="${DB_NAME:-fuxem}"
DB_USER="${DB_USER:-fuxem}"
DB_PASSWORD="${DB_PASSWORD:-}"
PM2_NAME="${PM2_NAME:-fuxem}"
NODE_MAJOR="${NODE_MAJOR:-20}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root: sudo bash deploy/setup-vps.sh"
  exit 1
fi

if [[ -z "${DOMAIN}" ]]; then
  echo "Usage: sudo DOMAIN=fuxem.com EMAIL=admin@fuxem.com DB_PASSWORD='strong-password' bash deploy/setup-vps.sh"
  exit 1
fi

if [[ -z "${DB_PASSWORD}" ]]; then
  echo "DB_PASSWORD is required."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx build-essential postgresql postgresql-contrib

curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
apt-get install -y nodejs
npm install -g pm2

if ! id -u postgres >/dev/null 2>&1; then
  echo "PostgreSQL user not found."
  exit 1
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
fi

mkdir -p "${APP_DIR}"
if [[ ! -d "${APP_DIR}/.git" ]]; then
  git clone --branch "${APP_BRANCH}" "${APP_REPO}" "${APP_DIR}"
else
  cd "${APP_DIR}"
  git fetch origin "${APP_BRANCH}" || true
  git checkout "${APP_BRANCH}" || true
  git pull origin "${APP_BRANCH}" || true
fi

cd "${APP_DIR}"
if [[ ! -f .env ]]; then
  cp .env.example .env
fi

cat > .env <<EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}?sslmode=disable"
JWT_SECRET="$(openssl rand -hex 32)"
NEXT_PUBLIC_API_URL="https://${DOMAIN}"
APP_URL="https://${DOMAIN}"
NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://your-supabase-project.supabase.co}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-your-supabase-anon-key}"
SMTP_HOST="${SMTP_HOST:-smtp.example.com}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_SECURE="${SMTP_SECURE:-false}"
SMTP_USER="${SMTP_USER:-smtp-user@example.com}"
SMTP_PASS="${SMTP_PASS:-smtp-password}"
SMTP_FROM="${SMTP_FROM:-noreply@${DOMAIN}}"
LIVEKIT_URL="${LIVEKIT_URL:-wss://your-livekit-host}"
LIVEKIT_API_KEY="${LIVEKIT_API_KEY:-your-livekit-api-key}"
LIVEKIT_API_SECRET="${LIVEKIT_API_SECRET:-your-livekit-api-secret}"
MAX_MEMBER_COUNT="${MAX_MEMBER_COUNT:-1000}"
CLOSED_GROUP_ENABLED="${CLOSED_GROUP_ENABLED:-false}"
REQUIRE_SIGNUP_INVITE="${REQUIRE_SIGNUP_INVITE:-false}"
NODE_ENV="production"
PORT="3000"
EOF

npm install
npm run build:vps
npx prisma migrate deploy

cat > /etc/nginx/sites-available/fuxem <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location ~ /.well-known/acme-challenge/ {
        root ${APP_DIR}/public;
    }
}
EOF

ln -sfn /etc/nginx/sites-available/fuxem /etc/nginx/sites-enabled/fuxem
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" >/tmp/fuxem-certbot.log 2>&1 || true
fi

pm2 delete "${PM2_NAME}" >/dev/null 2>&1 || true
pm2 start npm --name "${PM2_NAME}" -- start
pm2 save
systemctl enable pm2-root || true

cat <<EOF
Deployment setup complete.

Next checks:
- Visit https://${DOMAIN}
- Review /var/www/fuxem/.env for any service credentials you still need
- Check logs with: pm2 logs ${PM2_NAME}
EOF
