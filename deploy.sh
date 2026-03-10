#!/bin/bash
set -e

SHA=$(git rev-parse --short HEAD)
echo "Deploying commit $SHA..."

# 1. Push to GitHub
echo "→ Pushing to GitHub..."
git push

# 2. Deploy Convex functions
echo "→ Deploying Convex..."
cd apps/web
npx convex dev --once

# 3. Deploy web to Vercel
echo "→ Deploying web to Vercel..."
npx vercel --prod --build-env NEXT_PUBLIC_GIT_SHA="$SHA"

echo ""
echo "✓ Done! Deployed v$SHA to GitHub, Convex, and Vercel."
echo "→ iOS: Rebuild in Xcode to pick up v$SHA automatically."
