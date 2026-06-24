# Free VPS Analytics Setup (No Paid Tools)

This guide gives you traffic analytics and basic observability on a VPS for zero cost.

## What you get

- Traffic dashboard from Nginx access logs (GoAccess)
- Password-protected analytics page at `/analytics/`
- Auto-refresh report every 5 minutes
- PM2 and Nginx quick commands for ops checks

## Prerequisites

- Ubuntu or Debian VPS
- Nginx installed and serving your app
- App running behind Nginx (for example on `127.0.0.1:3000`)
- Existing Nginx site file, commonly `/etc/nginx/sites-available/fuxem`

## 1. Upload latest repo changes to the server

From your local machine, push these changes. Then on VPS:

```bash
cd /var/www/fuxem
git pull
```

## 2. Run one setup command

```bash
cd /var/www/fuxem
sudo bash deploy/setup-free-analytics.sh fuxem.com
```

Optional custom inputs:

```bash
sudo bash deploy/setup-free-analytics.sh <domain> <analytics-user> <nginx-site-path> <nginx-access-log>
```

Example:

```bash
sudo bash deploy/setup-free-analytics.sh fuxem.com adminstats /etc/nginx/sites-available/fuxem /var/log/nginx/access.log
```

## 3. Open your dashboard

- URL: `https://fuxem.com/analytics/`
- Login with the username/password you set during script run

## 4. Validate it is working

```bash
sudo tail -n 50 /var/log/goaccess-fuxem.log
sudo ls -lah /var/www/analytics/index.html
sudo nginx -t
```

## Useful runtime checks

### Nginx top endpoints

```bash
sudo awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -30
```

### Nginx top client IPs

```bash
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20
```

### PM2 app logs

```bash
pm2 logs fuxem --lines 120
```

## Security notes

- Keep analytics endpoint protected with basic auth.
- Use long random password for analytics user.
- Do not expose raw logs publicly.
- Restrict SSH and keep server patched.

## Troubleshooting

- If websocket does not update live, confirm Nginx includes the `/analytics/ws` block and has reloaded.
- If dashboard is blank, verify access log path passed to script exists.
- If cron is not running updates, inspect `/etc/cron.d/fuxem-goaccess` and `/var/log/goaccess-fuxem.log`.
