#!/usr/bin/env bash
# ==============================================================================
# IONITY CENTRAL - GCP ALWAYS-FREE VM SETUP & BOOTSTRAP SCRIPT
# Author: Johan Wilhelm van Antwerp / Antwerp Designs / Ionity Global
# Brand Palette: Canvas #1A1A1A | Text #FFFFFF | Accent #3366FF
# ==============================================================================

set -euo pipefail

HOST_IP="${1:-}"

echo "========================================================"
echo "⚡ IONITY CENTRAL - GOOGLE CLOUD VM SETUP (FREE TIER)"
echo "========================================================"

# 1. Setup 2GB Swap Memory (Crucial for e2-micro with 1GB RAM)
if [ ! -f /swapfile ]; then
    echo "🧠 Configuring 2GB Swap File for memory stability..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    sysctl -p
    echo "✅ 2GB Swap memory active."
fi

# 2. Update and install required packages
echo "📦 Updating packages and installing Nginx, Git, Curl, UFW..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx git curl ufw certbot python3-certbot-nginx

# 3. Configure Firewall
echo "🔒 Configuring UFW Firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 4. Create Web Directory & Copy Assets
echo "📂 Setting up /var/www/ionity-central..."
mkdir -p /var/www/ionity-central
if [ -d "/tmp/ionity-deploy" ]; then
    cp -r /tmp/ionity-deploy/* /var/www/ionity-central/ || true
fi
chown -R www-data:www-data /var/www/ionity-central
chmod -R 755 /var/www/ionity-central

# 5. Write Optimized Nginx Configuration
echo "⚙️ Configuring Nginx reverse proxy with PWA caching and security headers..."
cat << 'EOF' > /etc/nginx/sites-available/ionity-central
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/ionity-central;
    index index.html;

    # Performance Caching & Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Service Worker No-Cache Invalidation
    location /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
        expires off;
    }

    # Static Assets Fast Cache
    location ~* \.(ico|png|jpg|jpeg|svg|css|js|woff2|webp)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # SPA Fallback Routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 6. Enable configuration & reload Nginx
ln -sf /etc/nginx/sites-available/ionity-central /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

# 7. Setup Auto-Restart Watchdog Service
cat << 'EOF' > /etc/systemd/system/ionity-watchdog.service
[Unit]
Description=Ionity Central Health Check Watchdog
After=network.target nginx.service

[Service]
Type=oneshot
ExecStart=/bin/systemctl is-active --quiet nginx || /bin/systemctl restart nginx

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ionity-watchdog.service

echo "========================================================"
echo "✅ Ionity Central is successfully deployed and running!"
if [ -n "$HOST_IP" ]; then
    echo "🌐 Access your app at: http://${HOST_IP}"
    echo "🌐 Custom Domains: https://ionity.digital | https://central.ionity.today"
fi
echo "========================================================"
