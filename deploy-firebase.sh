#!/usr/bin/env bash
# ==============================================================================
# IONITY CENTRAL - AUTOMATED FIREBASE HOSTING DEPLOYMENT SCRIPT (BASH)
# Author: Johan Wilhelm van Antwerp / Antwerp Designs
# ==============================================================================

set -euo pipefail

echo "================================================================"
echo "⚡ IONITY CENTRAL - FIREBASE HOSTING DEPLOYMENT"
echo "Author: Johan Wilhelm van Antwerp | Antwerp Designs"
echo "================================================================"

PROJECT_ID="${1:-ionity-central}"

# Check firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing via npm..."
    npm install -g firebase-tools
fi

echo "🚀 Deploying Ionity Central to Firebase Hosting project: ${PROJECT_ID}..."
firebase deploy --project "${PROJECT_ID}" --only hosting

echo "================================================================"
echo "✅ Deployment complete! Live at https://${PROJECT_ID}.web.app"
echo "================================================================"
