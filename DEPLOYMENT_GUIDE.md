# ⚡ IONITY CENTRAL - CLOUD VM & FIREBASE HOSTING DEPLOYMENT GUIDE

> **Comprehensive Guide for 100% Free Hosting on Google Cloud Compute Engine (Always-Free Tier) and Global Edge Deployment via Firebase Hosting (Spark Free Tier).**

Architected & Maintained by **Johan Wilhelm van Antwerp** / **Antwerp Designs** for **Ionity Global**  
🌐 Live Ecosystem: [www.ionity.today](https://www.ionity.today) | [www.ionity.co.za](https://www.ionity.co.za)  
🎨 Brand Palette: Canvas `#1A1A1A` • Text `#FFFFFF` • Electric Blue `#3366FF` • Accent Gold `#FFA000`

---

## 🏛️ Architecture Overview

Ionity Central supports two complementary deployment architectures, both designed to run **100% free of charge** under Google Cloud and Firebase Always-Free quotas:

```
                                    +-------------------------------------------------------------+
                                    |                     IONITY CENTRAL                          |
                                    |              Antwerp Designs / Ionity Global                |
                                    +-------------------------------------------------------------+
                                                                   |
                                  +--------------------------------+--------------------------------+
                                  |                                                                 |
                                  v                                                                 v
             +-----------------------------------------+                       +-----------------------------------------+
             |       TIER A: FIREBASE HOSTING          |                       |       TIER B: GCP ALWAYS-FREE VM        |
             |       (Spark Plan - 100% Free)          |                       |       (Compute Engine Always-Free)      |
             +-----------------------------------------+                       +-----------------------------------------+
             | • 10 GB Free Hosting Storage            |                       | • 1x e2-micro VM (2 vCPU, 1GB RAM)      |
             | • 360 MB/day Data Transfer Quota        |                       | • 30 GB Standard Persistent Disk        |
             | • Global Anycast CDN Edge Caching       |                       | • 5 GB Cloud Storage Bucket             |
             | • Free Automated SSL on Custom Domains  |                       | • US Regions: us-central1 / us-west1    |
             |   (central.ionity.today)                |                       | • 2GB Swap + Nginx + Certbot SSL        |
             | • 1-Click `deploy-firebase.ps1`         |                       | • 1-Click `tools/deploy-gcp-vm.ps1`     |
             +-----------------------------------------+                       +-----------------------------------------+
```

---

## 🚀 Strategy 1: Firebase Hosting (Spark Free Plan)

Firebase Hosting provides zero-configuration global CDN hosting, automatic SSL certificates, and fast edge response times.

### Free Tier Limits (Spark Plan)
- **Hosting Storage**: 10 GB (free forever)
- **Data Transfer**: 360 MB/day (~10 GB/month)
- **Custom Domains**: Unlimited with free automatic Let's Encrypt SSL
- **Multiple Sites / Targets**: Supported under single project

### Step 1: One-Time Authentication
If you haven't logged into Firebase on your machine:
```powershell
firebase login
```

### Step 2: 1-Click PowerShell Deployment
Run our automated script:
```powershell
.\deploy-firebase.ps1 -ProjectId "ionity-central"
```
*Or simply run `firebase deploy --only hosting`.*

### Step 3: Connect Custom Domain (`central.ionity.today`)
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Hosting** > **Add Custom Domain**.
3. Enter `central.ionity.today` or `central.ionity.co.za`.
4. Add the provided `A` or `CNAME` records to your DNS provider (Cloudflare, cPanel, or Google Domains).
5. Firebase automatically provisions and renews SSL certificates within 24 hours.

---

## 🖥️ Strategy 2: Google Cloud Platform (GCP) Always-Free VM

Google Cloud offers an **Always Free Tier** for Compute Engine and Cloud Storage that renews every month indefinitely.

### GCP Free-Tier Specifications (100% Free Quota)
- **Compute Instance**: 1x `e2-micro` instance (2 shared vCPUs, 1.0 GB RAM)
- **Eligible Free Regions**: Must be in one of the following US regions:
  - `us-central1` (Iowa, default in our scripts)
  - `us-east1` (South Carolina)
  - `us-west1` (Oregon)
- **Persistent Disk**: Up to 30 GB of Standard Persistent Disk (`pd-standard`) per month.
- **Cloud Storage**: 5 GB-months of Standard Storage in US regions (`gs://ionity-storage-[PROJECT_ID]`).
- **Egress Network**: 1 GB of outbound network traffic per month to worldwide destinations.

### Automated 1-Click Provisioning (PowerShell)
Execute our deployment orchestrator from the project directory:
```powershell
.\tools\deploy-gcp-vm.ps1 -ProjectId "YOUR_GCP_PROJECT_ID" -Zone "us-central1-a"
```

What the script automates:
1. Enables `compute.googleapis.com` and `storage.googleapis.com`.
2. Configures VPC Firewall rules for web traffic (Port 80/443).
3. Creates a 5GB free Cloud Storage bucket for document snapshots.
4. Provisions an `e2-micro` instance with a 30GB `pd-standard` Ubuntu 24.04 LTS disk.
5. Configures a **2GB Linux Swapfile** (`/swapfile`) to ensure 1GB RAM never crashes under load.
6. Deploys Nginx reverse proxy with gzip compression, security headers, and PWA caching.
7. Sets up an automated `ionity-watchdog.service` systemd daemon for 99.99% uptime.

---

## ⚙️ Configuration Files Summary

| File | Purpose |
|---|---|
| `firebase.json` | Firebase Hosting routing rules, PWA caching headers, and SPA rewrites. |
| `.firebaserc` | Firebase project environment mapping. |
| `deploy-firebase.ps1` | 1-Click PowerShell deployer for Firebase. |
| `deploy-firebase.sh` | Bash deployer for Firebase. |
| `tools/deploy-gcp-vm.ps1` | Automated PowerShell orchestrator for GCP Always-Free VM & Storage. |
| `deploy-gcp.sh` | VM bootstrap script (Swapfile, Nginx, UFW Firewall, Certbot SSL). |
| `js/firebase-manager.js` | In-app Firebase client integration and cloud backup synchronization. |
| `.github/workflows/firebase-deploy.yml` | Continuous deployment pipeline for GitHub Actions. |

---

## 🔒 Security & Performance Features
- **PWA Service Worker Cache Busting**: `sw.js` is served with `Cache-Control: no-cache, no-store, must-revalidate` so updates apply instantly.
- **Static Asset Immutability**: All logos, fonts, CSS, and JS bundles are cached with `max-age=604800` (7 days) for instantaneous page loads.
- **Security Headers**: Both Nginx and Firebase inject `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `X-XSS-Protection: 1; mode=block`.
