<#
.SYNOPSIS
    Ionity Central - Automated 1-Click Firebase Hosting Deployment Script
.DESCRIPTION
    Deploys Ionity Central to Firebase Hosting (Spark Free Tier) with 10GB free storage and global CDN caching.
.PARAMETER ProjectId
    Optional Firebase project ID. If omitted, uses the active project or prompts for one.
.EXAMPLE
    .\deploy-firebase.ps1 -ProjectId "ionity-central"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$ProjectId = ""
)

$ErrorActionPreference = "Stop"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "⚡ IONITY CENTRAL - FIREBASE HOSTING DEPLOYMENT" -ForegroundColor Cyan
Write-Host "Author: Johan Wilhelm van Antwerp | Antwerp Designs" -ForegroundColor DarkGray
Write-Host "Brand: Ionity Global (#1A1A1A / #3366FF)" -ForegroundColor DarkGray
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Verify firebase-tools CLI is installed
Write-Host "`n🔍 Checking Firebase CLI..." -ForegroundColor Yellow
if (-not (Get-Command "firebase" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not found. Installing via npm..." -ForegroundColor Red
    npm install -g firebase-tools
} else {
    $fbVer = firebase --version
    Write-Host "✅ Firebase CLI is installed (v$fbVer)" -ForegroundColor Green
}

# 2. Check Firebase Login Status
Write-Host "`n🔑 Checking Firebase Authentication..." -ForegroundColor Yellow
try {
    $authStatus = firebase login:list 2>&1
    Write-Host "$authStatus" -ForegroundColor DarkGray
} catch {
    Write-Host "ℹ️ Please log in to Firebase..." -ForegroundColor Yellow
    firebase login
}

# 3. Determine Project ID
if ([string]::IsNullOrWhiteSpace($ProjectId)) {
    # Check if .firebaserc has a configured project
    if (Test-Path ".firebaserc") {
        $rc = Get-Content ".firebaserc" | ConvertFrom-Json
        $ProjectId = $rc.projects.default
    }
    
    if ([string]::IsNullOrWhiteSpace($ProjectId) -or $ProjectId -eq "ionity-central") {
        Write-Host "`nEnter your Firebase Project ID (or press Enter to use '$ProjectId'):" -ForegroundColor White
        $customId = Read-Host "Project ID"
        if (-not [string]::IsNullOrWhiteSpace($customId)) {
            $ProjectId = $customId.Trim()
        }
    }
}

Write-Host "🎯 Target Firebase Project: " -NoNewline -ForegroundColor White
Write-Host "$ProjectId" -ForegroundColor Cyan

# 4. Deploy to Firebase Hosting
Write-Host "`n🚀 Deploying Ionity Central to Firebase Hosting (Spark Free Tier)..." -ForegroundColor Yellow
try {
    firebase deploy --project "$ProjectId" --only hosting
    
    Write-Host "`n================================================================" -ForegroundColor Green
    Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "🌐 Live URL: https://$ProjectId.web.app" -ForegroundColor Cyan
    Write-Host "🌐 Custom Domain: https://central.ionity.today (if DNS connected)" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Deployment encountered an issue: $_" -ForegroundColor Red
    Write-Host "Tip: Run 'firebase use $ProjectId' or 'firebase login --reauth' if permission denied." -ForegroundColor Yellow
}
