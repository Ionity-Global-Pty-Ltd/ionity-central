/**
 * IONITY CENTRAL - GOOGLE CLOUD VM & FIREBASE HOSTING HUB
 * Interactive deployment guide, Always-Free Tier VM provisioner, and live simulated cloud terminal.
 * Author: Johan Wilhelm van Antwerp / Antwerp Designs / Ionity Global
 */

class GCPHelper {
  static getDeploymentScript() {
    const config = StorageManager.get(STORAGE_KEYS.CONFIG, {});
    const vmIp = config.vmIp || '34.120.45.89';

    return `#!/usr/bin/env bash
# ==============================================================================
# IONITY CENTRAL - GCP ALWAYS-FREE TIER VM & STORAGE SETUP SCRIPT
# Author: Johan Wilhelm van Antwerp / Antwerp Designs / Ionity Global
# Brand: Canvas #1A1A1A | Text #FFFFFF | Accent #3366FF
# ==============================================================================

set -euo pipefail

echo "⚡ [Ionity GCP Setup] Provisioning Ubuntu 24.04 LTS e2-micro Free Tier Instance..."

# 1. Configure 2GB Swap Memory (Crucial for e2-micro with 1GB RAM)
if [ ! -f /swapfile ]; then
    echo "🧠 Configuring 2GB Swap File for memory stability..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    sysctl -p
fi

# 2. Install Nginx, Git, Curl, UFW & SSL Certbot
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx git curl ufw certbot python3-certbot-nginx

# 3. Configure Firewall Rules (HTTP, HTTPS, SSH)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 4. Clone / Deploy Ionity Central App
mkdir -p /var/www/ionity-central
if [ -d "/tmp/ionity-deploy" ]; then
    cp -r /tmp/ionity-deploy/* /var/www/ionity-central/ || true
fi
chown -R www-data:www-data /var/www/ionity-central
chmod -R 755 /var/www/ionity-central

# 5. Configure Nginx Server Block with PWA Caching & Security Headers
cat << 'EOF' > /etc/nginx/sites-available/ionity-central
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${vmIp} central.ionity.today central.ionity.co.za;

    root /var/www/ionity-central;
    index index.html;

    # Performance Compression
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

    # PWA Service Worker caching
    location /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }

    # Static Assets Fast Cache
    location ~* \\.(ico|png|jpg|jpeg|svg|css|js|woff2|webp)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # SPA Fallback Routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 6. Enable Site & Restart Nginx
ln -sf /etc/nginx/sites-available/ionity-central /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "✅ [Ionity GCP Setup] Deployment Complete! App live at http://${vmIp}"
`;
  }

  static getPowerShellScript() {
    const config = StorageManager.get(STORAGE_KEYS.CONFIG, {});
    const fbConfig = FirebaseManager.getConfig();
    const projId = fbConfig.projectId || 'ionity-central';

    return `# ==============================================================================
# IONITY CENTRAL - 1-CLICK GCP ALWAYS-FREE VM & FIREBASE PROVISIONER (POWERSHELL)
# ==============================================================================
.\\tools\\deploy-gcp-vm.ps1 -ProjectId "${projId}" -Zone "us-central1-a"
`;
  }

  static renderGuide() {
    const codeEl = document.getElementById('gcp-script-preview');
    if (codeEl) {
      codeEl.textContent = this.getDeploymentScript();
    }
    const psEl = document.getElementById('gcp-ps-script-preview');
    if (psEl) {
      psEl.textContent = this.getPowerShellScript();
    }
    this.renderTerminal();
  }

  static renderTerminal() {
    const termEl = document.getElementById('gcp-terminal-output');
    if (termEl && !termEl.textContent) {
      termEl.innerHTML = `<span style="color:#73daca;">root@ionity-central-vm (us-central1-a):~#</span> systemctl status nginx\n<span style="color:#9ece6a;">● nginx.service - A high performance web server and a reverse proxy server</span>\n   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)\n   Active: <span style="color:#00E676; font-weight:bold;">active (running)</span> (Always Free Tier: e2-micro | 30GB Disk | 2GB Swap)\n  Process: 1420 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)\n Main PID: 1421 (nginx)\n    Tasks: 2 (limit: 1141)\n   Memory: 9.2M / 1.0G (Swap: 48M / 2.0G)\n      CPU: 182ms\n   CGroup: /system.slice/nginx.service\n           ├─1421 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"\n           └─1422 "nginx: worker process"\n\n<span style="color:#73daca;">root@ionity-central-vm (us-central1-a):~#</span> `;
    }
  }

  static runTerminalCommand(cmd) {
    const termEl = document.getElementById('gcp-terminal-output');
    if (!termEl) return;

    NotificationManager.play8BitChime('click');
    termEl.innerHTML += `\n<span style="color:#73daca;">root@ionity-central-vm:~#</span> ${cmd}\n`;

    let output = '';
    if (cmd === 'nginx -t') {
      output = `<span style="color:#9ece6a;">nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful</span>`;
    } else if (cmd === 'firebase deploy') {
      const proj = FirebaseManager.getConfig().projectId || 'ionity-central';
      output = `=== Deploying to '${proj}' ===\n\ni  deploying hosting\n✔  hosting[${proj}]: beginning deploy...\n✔  hosting[${proj}]: found 32 files in .\n✔  hosting: upload complete\n✔  hosting: release complete\n\n<span style="color:#00E676; font-weight:bold;">✔  Deploy complete!</span>\n\nProject Console: https://console.firebase.google.com/project/${proj}/overview\nHosting URL: <span style="color:#3366FF; text-decoration:underline;">https://${proj}.web.app</span>`;
    } else if (cmd === 'gcloud compute instances list') {
      output = `NAME               ZONE           MACHINE_TYPE  PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP    STATUS\nionity-central-vm  us-central1-a  e2-micro                   10.128.0.2   34.120.45.89   <span style="color:#00E676; font-weight:bold;">RUNNING</span>`;
    } else if (cmd === 'free -h') {
      output = `               total        used        free      shared  buff/cache   available\nMem:           982Mi       340Mi       380Mi        12Mi       262Mi       590Mi\nSwap:          2.0Gi        48Mi       1.9Gi`;
    } else if (cmd === 'df -h') {
      output = `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        30G  3.8G   25G  14% / (30GB Standard Free Tier Disk)\nudev            480M     0  480M   0% /dev\ntmpfs            99M  1.1M   98M   2% /run`;
    } else if (cmd === 'certbot certificates') {
      output = `Found the following certs:\n  Certificate Name: central.ionity.today\n    Domains: central.ionity.today central.ionity.co.za\n    Expiry Date: 2026-11-19 08:30:12+00:00 (VALID: 92 days)\n    Certificate Path: /etc/letsencrypt/live/central.ionity.today/fullchain.pem`;
    } else if (cmd === 'top') {
      output = `Tasks: 78 total, 1 running, 77 sleeping, 0 stopped\n%Cpu(s):  0.8 us,  0.2 sy,  0.0 ni, 99.0 id,  0.0 wa\nMiB Mem :    982.4 total,    410.2 free,    320.8 used,    251.4 buff/cache\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1421 www-data  20   0   14280   8412   4120 S   0.0   0.8   0:00.18 nginx`;
    } else if (cmd === 'restart') {
      output = `<span style="color:#FFD600;">[systemd] Restarting nginx.service and flushing cache...</span>\n<span style="color:#00E676;">[OK] Nginx restarted cleanly. 0 HTTP error logs recorded.</span>`;
    } else {
      output = `Command executed successfully. (Exit code 0)`;
    }

    setTimeout(() => {
      termEl.innerHTML += `${output}\n<span style="color:#73daca;">root@ionity-central-vm:~#</span> `;
      termEl.scrollTop = termEl.scrollHeight;
      NotificationManager.play8BitChime('powerup');
    }, 200);
  }

  static copyScript() {
    navigator.clipboard.writeText(this.getDeploymentScript());
    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('GCP VM Setup Script copied to clipboard!', 'success');
  }

  static copyPowerShellScript() {
    navigator.clipboard.writeText(this.getPowerShellScript());
    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('GCP VM PowerShell Provisioner command copied!', 'success');
  }

  static copyFirebaseCommand() {
    FirebaseManager.copyCommand('firebase');
  }

  static getSSHCommand() {
    const fbConfig = FirebaseManager.getConfig();
    const projId = fbConfig.projectId || 'ionity-root-system';
    return `gcloud compute ssh ionity-central-vm --zone "us-central1-a" --project "${projId}"`;
  }

  static getDirectSSHCommand() {
    const config = StorageManager.get(STORAGE_KEYS.CONFIG, {});
    const vmIp = config.vmIp || '34.120.45.89';
    return `ssh root@${vmIp}`;
  }

  static copySSHCommand(type = 'gcloud') {
    const cmd = type === 'direct' ? this.getDirectSSHCommand() : this.getSSHCommand();
    navigator.clipboard.writeText(cmd);
    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast(`Copied SSH command: ${cmd}`, 'success');
  }

  static openGoogleCloudWebSSH() {
    NotificationManager.play8BitChime('laser');
    const fbConfig = FirebaseManager.getConfig();
    const projId = fbConfig.projectId || 'ionity-root-system';
    const webSshUrl = `https://ssh.cloud.google.com/v2/ssh/projects/${projId}/zones/us-central1-a/instances/ionity-central-vm?authuser=0&hl=en`;
    window.open(webSshUrl, '_blank', 'width=1024,height=700');
    NotificationManager.showToast('🚀 Opening Google Cloud Web SSH terminal...', 'info');
  }

  static openWebSSHTtyd() {
    const config = StorageManager.get(STORAGE_KEYS.CONFIG, {});
    const vmIp = config.vmIp || '34.120.45.89';
    const ttydUrl = `http://${vmIp}:7681/`;
    window.open(ttydUrl, '_blank', 'width=1024,height=700');
    NotificationManager.play8BitChime('laser');
    NotificationManager.showToast('🚀 Connecting to In-Browser WebSSH daemon...', 'info');
  }
}
