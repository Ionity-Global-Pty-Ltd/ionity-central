# 🚀 Complete Deployment Guide

This guide covers deploying Ionity Central to **Firebase Hosting** and the **Always-Free Google Cloud VM**.

## 1. Firebase Web Hosting Deployment

```powershell
# Authenticate
firebase login

# Deploy to ionity-root-system
firebase deploy --only hosting --project ionity-root-system
```

Production Endpoint: `https://ionity-root-system.web.app`

## 2. Google Cloud VM Provisioning (e2-micro Always Free)

Run the PowerShell orchestrator:
```powershell
.\tools\deploy-gcp-vm.ps1 -ProjectId "ionity-root-system" -Zone "us-central1-a"
```

The script performs:
1. `gcloud services enable compute.googleapis.com storage-component.googleapis.com`
2. Configures firewall `ufw allow 22, 80, 443/tcp`.
3. Creates VM `ionity-central-vm` with 30GB disk in `us-central1-a`.
4. Uploads files via `gcloud compute scp`.
5. Runs `deploy-gcp.sh` to configure 2GB swapfile, Nginx HTTP/2, and Certbot SSL.

## 3. SSH Connectivity

- **Google Cloud Web SSH**: Click `🚀 1-Click Web SSH` in the app dashboard.
- **CLI**: `gcloud compute ssh ionity-central-vm --zone "us-central1-a" --project "ionity-root-system"`
- **In-Browser WebSSH (ttyd)**: Run `bash tools/setup-webssh-ttyd.sh` on the VM.
