#!/usr/bin/env bash
# ==============================================================================
# IONITY CENTRAL - IN-BROWSER WEBSSH (TTYD) DAEMON INSTALLER
# Installs ttyd lightweight C-based terminal on Always-Free e2-micro VM
# Exposes authenticated WebSocket terminal behind Nginx reverse proxy
# Author: Johan Wilhelm van Antwerp / Antwerp Designs / Ionity Global
# ==============================================================================

set -euo pipefail

echo "⚡ [Ionity WebSSH] Installing ttyd daemon on VM..."

# 1. Download Latest ttyd binary
TTYD_VERSION="1.7.7"
ARCH="x86_64"
curl -sL "https://github.com/tsl0922/ttyd/releases/download/${TTYD_VERSION}/ttyd.${ARCH}" -o /usr/local/bin/ttyd
chmod +x /usr/local/bin/ttyd

# 2. Create Systemd Service
cat << 'EOF' > /etc/systemd/system/ttyd.service
[Unit]
Description=Ionity WebSSH Terminal Daemon
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/local/bin/ttyd --port 7681 --writable -c ionity:AntwerpDesigns2026! bash
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 3. Reload and Start ttyd
systemctl daemon-reload
systemctl enable ttyd
systemctl restart ttyd

echo "✅ [Ionity WebSSH] ttyd daemon is active and listening on port 7681!"
