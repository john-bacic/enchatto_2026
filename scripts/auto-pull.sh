#!/bin/sh
# Auto-pull latest from GitHub if there are new commits
# Runs periodically via launchd

REPO="/Users/johnbacic/Documents/enCHATTO_2026/enchatto"
cd "$REPO" || exit 1

# Only pull if no uncommitted changes (avoid conflicts)
if [ -n "$(git status --porcelain)" ]; then
  exit 0
fi

# Fetch and check if behind
git fetch origin main --quiet 2>/dev/null
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
  git pull --ff-only origin main --quiet 2>/dev/null
fi
