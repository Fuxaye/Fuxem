#!/usr/bin/env bash
set -euo pipefail

# Free VPS analytics bootstrap for Nginx + PM2 stacks.
# Installs GoAccess, creates protected dashboard endpoint, and installs daily report cron.

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/setup-free-analytics.sh"
  exit 1
fi

DOMAIN="${1:-}"
USERNAME="${2:-analyticsadmin}"
NGINX_SITE="${3:-/etc/nginx/sites-available/fuxem}"
ACCESS_LOG="${4:-/var/log/nginx/access.log}"
ANALYTICS_DIR="/var/www/analytics"
HTPASSWD_FILE="/etc/nginx/.htpasswd_fuxem_analytics"
GOACCESS_CONF="/etc/goaccess/fuxem.conf"
CRON_FILE="/etc/cron.d/fuxem-goaccess"
SNIPPET_FILE="/etc/nginx/snippets/fuxem-analytics.conf"

if [[ -z "${DOMAIN}" ]]; then
  echo "Usage: sudo bash deploy/setup-free-analytics.sh <domain> [analytics-username] [nginx-site-path] [nginx-access-log]"
  echo "Example: sudo bash deploy/setup-free-analytics.sh fuxem.com"
  exit 1
fi

if [[ ! -f "${NGINX_SITE}" ]]; then
  echo "Nginx site file not found: ${NGINX_SITE}"
  exit 1
fi

if [[ ! -f "${ACCESS_LOG}" ]]; then
  echo "Nginx access log not found: ${ACCESS_LOG}"
  exit 1
fi

echo "Installing dependencies..."
apt update
apt install -y goaccess apache2-utils

echo "Preparing analytics directory..."
mkdir -p "${ANALYTICS_DIR}"
chown -R www-data:www-data "${ANALYTICS_DIR}"

if [[ ! -f "${HTPASSWD_FILE}" ]]; then
  echo "Creating auth user (${USERNAME}). You will be prompted for a password."
  htpasswd -c "${HTPASSWD_FILE}" "${USERNAME}"
else
  echo "Auth file exists at ${HTPASSWD_FILE}."
  echo "To add or update user later: sudo htpasswd ${HTPASSWD_FILE} ${USERNAME}"
fi

cat > "${GOACCESS_CONF}" <<EOF
time-format %T
date-format %d/%b/%Y
log-format COMBINED
output ${ANALYTICS_DIR}/index.html
EOF

echo "Writing Nginx snippet to ${SNIPPET_FILE}..."
mkdir -p /etc/nginx/snippets
cat > "${SNIPPET_FILE}" <<'EOF'
# Include this inside the existing server {} block for your site.

location /analytics/ {
    alias /var/www/analytics/;
    index index.html;
    auth_basic "Restricted Analytics";
    auth_basic_user_file /etc/nginx/.htpasswd_fuxem_analytics;
}
EOF

if ! grep -q "include /etc/nginx/snippets/fuxem-analytics.conf;" "${NGINX_SITE}"; then
  echo "Adding snippet include to ${NGINX_SITE}..."
  if grep -q "server_name .*;" "${NGINX_SITE}"; then
    awk '
      BEGIN { inserted = 0 }
      {
        print
        if (!inserted && $0 ~ /server_name .*;/ ) {
          print "        include /etc/nginx/snippets/fuxem-analytics.conf;"
          inserted = 1
        }
      }
    ' "${NGINX_SITE}" > "${NGINX_SITE}.tmp"
    mv "${NGINX_SITE}.tmp" "${NGINX_SITE}"
  else
    echo "Could not find location / block in ${NGINX_SITE}; add this line manually inside your server block:"
    echo "include /etc/nginx/snippets/fuxem-analytics.conf;"
  fi
else
  echo "Snippet include already present, skipping update."
fi

echo "Validating Nginx config..."
nginx -t
systemctl reload nginx

echo "Generating initial report..."
goaccess "${ACCESS_LOG}" --config-file="${GOACCESS_CONF}"

cat > "${CRON_FILE}" <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

*/5 * * * * root /usr/bin/goaccess ${ACCESS_LOG} --config-file=${GOACCESS_CONF} > /var/log/goaccess-fuxem.log 2>&1
EOF

chmod 0644 "${CRON_FILE}"
systemctl restart cron || systemctl restart crond || true

echo
echo "Done. Open: https://${DOMAIN}/analytics/"
echo "Log file: /var/log/goaccess-fuxem.log"
echo "Auth file: ${HTPASSWD_FILE}"
echo "Snippet: ${SNIPPET_FILE}"
