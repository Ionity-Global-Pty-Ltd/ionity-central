<#
.SYNOPSIS
    IONITY CENTRAL - 100% ALWAYS-FREE GOOGLE CLOUD VM & STORAGE PROVISIONER
.DESCRIPTION
    Provisions and configures an e2-micro Google Cloud Compute Engine VM instance 
    (100% within GCP Always Free Tier) with 30GB standard disk, 5GB Cloud Storage,
    Nginx web server, Let's Encrypt SSL, and automated firewall rules.
.PARAMETER ProjectId
    GCP Project ID (e.g. 'ionity-central-prod' or your existing project).
.PARAMETER InstanceName
    Name of the VM instance. Defaults to 'ionity-central-vm'.
.PARAMETER Zone
    GCP Zone eligible for Always Free tier (us-central1-a, us-west1-b, us-east1-c). Defaults to 'us-central1-a'.
.EXAMPLE
    .\tools\deploy-gcp-vm.ps1 -ProjectId "my-gcp-project"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$ProjectId = "",

    [Parameter(Mandatory = $false)]
    [string]$InstanceName = "ionity-central-vm",

    [Parameter(Mandatory = $false)]
    [string]$Zone = "us-central1-a",

    [Parameter(Mandatory = $false)]
    [switch]$SkipFileTransfer
)

$ErrorActionPreference = "Stop"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "⚡ IONITY CENTRAL - GCP ALWAYS-FREE TIER VM & STORAGE DEPLOY" -ForegroundColor Cyan
Write-Host "Author: Johan Wilhelm van Antwerp | Antwerp Designs" -ForegroundColor DarkGray
Write-Host "Machine Type: e2-micro | 30GB Disk | 5GB Storage (100% Free Tier)" -ForegroundColor DarkGray
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Verify Google Cloud SDK
Write-Host "`n🔍 Checking Google Cloud SDK..." -ForegroundColor Yellow
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI not found! Please install Google Cloud SDK." -ForegroundColor Red
    exit 1
}
$gcloudVer = gcloud --version | Select-Object -First 1
Write-Host "✅ $gcloudVer detected." -ForegroundColor Green

# 2. Configure GCP Project
if ([string]::IsNullOrWhiteSpace($ProjectId)) {
    $currentProj = (gcloud config get-value project 2>$null).Trim()
    if (-not [string]::IsNullOrWhiteSpace($currentProj) -and $currentProj -ne "(unset)") {
        $ProjectId = $currentProj
    } else {
        Write-Host "`nEnter your Google Cloud Project ID:" -ForegroundColor White
        $ProjectId = (Read-Host "Project ID").Trim()
    }
}

Write-Host "🎯 Target GCP Project: " -NoNewline -ForegroundColor White
Write-Host "$ProjectId" -ForegroundColor Cyan

Write-Host "📍 Target Free-Tier Zone: " -NoNewline -ForegroundColor White
Write-Host "$Zone (US Region - Always Free Tier)" -ForegroundColor Cyan

gcloud config set project "$ProjectId" --quiet

# 3. Enable Required Google Cloud APIs
Write-Host "`n⚙️ Enabling Compute Engine & Cloud Storage APIs..." -ForegroundColor Yellow
gcloud services enable compute.googleapis.com storage.googleapis.com --project "$ProjectId"

# 4. Configure Firewall Rules (HTTP / HTTPS / SSH)
Write-Host "`n🔒 Configuring VPC Firewall Rules for Web Traffic (Port 80/443)..." -ForegroundColor Yellow
$fwCheck = gcloud compute firewall-rules list --filter="name=ionity-allow-web" --format="value(name)" --project "$ProjectId" 2>$null
if (-not $fwCheck) {
    gcloud compute firewall-rules create ionity-allow-web `
        --project="$ProjectId" `
        --direction=INGRESS `
        --priority=1000 `
        --network=default `
        --action=ALLOW `
        --rules=tcp:80,tcp:443 `
        --source-ranges=0.0.0.0/0 `
        --target-tags=http-server,https-server `
        --description="Allow incoming HTTP and HTTPS traffic for Ionity Central"
    Write-Host "✅ Firewall rule 'ionity-allow-web' created." -ForegroundColor Green
} else {
    Write-Host "✅ Firewall rule 'ionity-allow-web' already exists." -ForegroundColor Green
}

# 5. Create Free Storage Bucket (5 GB Free Tier)
$bucketName = "ionity-storage-$($ProjectId.ToLower())"
Write-Host "`n📦 Checking Cloud Storage Bucket ($bucketName)..." -ForegroundColor Yellow
$bucketExists = gcloud storage buckets list --filter="name=$bucketName" --format="value(name)" --project "$ProjectId" 2>$null
if (-not $bucketExists) {
    Write-Host "Creating Free-Tier Standard Storage Bucket in US multi-region..." -ForegroundColor DarkGray
    gcloud storage buckets create "gs://$bucketName" --project="$ProjectId" --location=US --default-storage-class=STANDARD
    Write-Host "✅ Cloud Storage Bucket gs://$bucketName created." -ForegroundColor Green
} else {
    Write-Host "✅ Cloud Storage Bucket gs://$bucketName ready." -ForegroundColor Green
}

# 6. Check / Create Compute Engine VM Instance (e2-micro, 30GB pd-standard)
Write-Host "`n🖥️ Checking Compute Engine Instance ($InstanceName)..." -ForegroundColor Yellow
$vmStatus = gcloud compute instances list --filter="name=$InstanceName AND zone:($Zone)" --format="value(status)" --project "$ProjectId" 2>$null

if (-not $vmStatus) {
    Write-Host "🚀 Creating Always-Free e2-micro VM Instance in $Zone..." -ForegroundColor Yellow
    Write-Host "   • Machine: e2-micro (2 vCPU, 1 GB RAM)" -ForegroundColor DarkGray
    Write-Host "   • Boot Disk: 30 GB Standard Persistent Disk (pd-standard)" -ForegroundColor DarkGray
    Write-Host "   • OS: Ubuntu 24.04 LTS Minimal" -ForegroundColor DarkGray
    
    gcloud compute instances create "$InstanceName" `
        --project="$ProjectId" `
        --zone="$Zone" `
        --machine-type="e2-micro" `
        --network-interface="network-tier=STANDARD,subnet=default" `
        --maintenance-policy="MIGRATE" `
        --tags="http-server,https-server" `
        --create-disk="auto-delete=yes,boot=yes,image-family=ubuntu-2404-lts-amd64,image-project=ubuntu-os-cloud,mode=rw,size=30,type=pd-standard" `
        --metadata="enable-oslogin=TRUE" `
        --description="Ionity Central Workspace - Always Free Tier VM"

    Write-Host "✅ VM Instance '$InstanceName' created successfully!" -ForegroundColor Green
    
    # Allow 30 seconds for VM to finish initial boot
    Write-Host "⏳ Waiting for SSH subsystem to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 25
} else {
    Write-Host "✅ VM Instance '$InstanceName' is already running ($vmStatus)." -ForegroundColor Green
}

# 7. Get External IP Address
$extIp = (gcloud compute instances describe "$InstanceName" --zone="$Zone" --project="$ProjectId" --format="value(networkInterfaces[0].accessConfigs[0].natIP)").Trim()
Write-Host "`n🌐 Instance External IP: " -NoNewline -ForegroundColor White
Write-Host "$extIp" -ForegroundColor Cyan

# 8. Copy Application Files & Bootstrap VM
if (-not $SkipFileTransfer) {
    Write-Host "`n📤 Uploading Ionity Central application to VM..." -ForegroundColor Yellow
    
    # Upload deploy-gcp.sh and app files
    gcloud compute scp --recurse `
        index.html favicon.ico manifest.json sw.js css js assets icons deploy-gcp.sh `
        "${InstanceName}:/tmp/ionity-deploy/" `
        --zone="$Zone" `
        --project="$ProjectId" `
        --quiet

    Write-Host "⚙️ Executing automated bootstrap and Nginx installer on VM..." -ForegroundColor Yellow
    gcloud compute ssh "$InstanceName" `
        --zone="$Zone" `
        --project="$ProjectId" `
        --command="chmod +x /tmp/ionity-deploy/deploy-gcp.sh && cd /tmp/ionity-deploy && sudo ./deploy-gcp.sh '$extIp'" `
        --quiet
}

Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "⚡ IONITY CENTRAL - GCP VM DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Live VM URL: http://$extIp" -ForegroundColor Cyan
Write-Host "📦 Cloud Storage Bucket: gs://$bucketName" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Green
