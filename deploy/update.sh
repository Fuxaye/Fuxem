#!/usr/bin/env bash
set -euo pipefail

# Safe production update: pull, migrate, build, restart. Does not overwrite .env.
#
# Usage on VPS:
#   cd /var/www/fuxem && bash deploy/update.sh
#
# Optional env:
#   APP_DIR=/var/www/fuxem APP_BRANCH=main PM2_NAME=fuxem

APP_DIR="${APP_DIR:-/var/www/fuxem}"
APP_BRANCH="${APP_BRANCH:-main}"
PM2_NAME="${PM2_NAME:-fuxem}"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  echo "Not a git repo: ${APP_DIR}"
  exit 1
fi

cd "${APP_DIR}"

echo "==> Fetch ${APP_BRANCH}"
git fetch origin "${APP_BRANCH}"
git checkout "${APP_BRANCH}"
git pull --ff-only origin "${APP_BRANCH}"

echo "==> Install dependencies"
npm install

echo "==> Database migrations"
npm run db:deploy

echo "==> Production build"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
npm run build:vps

echo "==> Restart PM2 (${PM2_NAME})"
if pm2 describe "${PM2_NAME}" >/dev/null 2>&1; then
  pm2 restart "${PM2_NAME}"
else
  pm2 start deploy/ecosystem.config.js
fi
pm2 save

echo "Deploy complete. Tail logs: pm2 logs ${PM2_NAME} --lines 50"
