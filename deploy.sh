#!/bin/bash
# Ships the current commit: Convex functions to both deployments, then the web app to Vercel.
#
#   production  basic-ram-104        the web app on Vercel and Release (TestFlight / App Store) iOS builds
#   dev         helpful-bulldog-420  Debug iOS builds, local dev, and rooms made by older iOS builds,
#                                    which the web app reaches through NEXT_PUBLIC_CONVEX_LEGACY_URL
#
# The one web build talks to both deployments, and open tabs reload onto a new build within a minute
# (DeployRefresh), so both deployments get the new functions before the web build goes live.
set -euo pipefail
cd "$(dirname "$0")"

# convex deploy asks before it pushes to production, and without a terminal it cannot ask
if [ ! -t 0 ]; then
  echo "Run ./deploy.sh in a terminal: it asks before pushing to production." >&2
  exit 1
fi

SITE_URL="https://enchatto.vercel.app"
# Seven characters, the same slice next.config.js takes
SHA=$(git rev-parse HEAD)
SHA=${SHA:0:7}

# Convex and Vercel both upload the working tree, not the commit: uncommitted changes in anything
# they read would ship under this commit's SHA.
SHIPPED=(apps/web packages package.json package-lock.json apps/convex/package.json .vercelignore)
dirty=$(git status --porcelain -- "${SHIPPED[@]}")
if [ -n "$dirty" ]; then
  echo "Uncommitted changes in files that ship. Commit or stash them first:" >&2
  echo "$dirty" >&2
  exit 1
fi

# A push that would be rejected should fail now, not after production has changed
git push --dry-run --quiet

# The Convex CLI skips its own type check here (tsc is hoisted to the root node_modules), so a type
# error would otherwise first show up in the Vercel build, after production Convex had changed.
echo "→ Type check..."
npx tsc --noEmit -p apps/web

# The tests run the Convex functions that are about to be pushed, in memory, in a few seconds. CI runs
# them as well, but only on the push below, which comes after production Convex has changed.
echo "→ Tests..."
npm test

echo "Deploying $SHA..."

echo "→ Convex dev (helpful-bulldog-420)..."
(cd apps/web && npx convex dev --once)

# convex/_generated is committed because the Vercel build type-checks against it
regenerated=$(git status --porcelain -- apps/web/convex/_generated)
if [ -n "$regenerated" ]; then
  echo "Convex regenerated apps/web/convex/_generated. Commit it and run this again." >&2
  exit 1
fi

# Asks for confirmation before it pushes; answering no stops the script here
echo "→ Convex production (basic-ram-104)..."
(cd apps/web && npx convex deploy)

echo "→ Pushing to GitHub..."
git push

# The Vercel project's Root Directory is apps/web, so the CLI has to run from the repo root.
# --force skips the build cache, which has served stale chunks before. NO_UPDATE_NOTIFIER keeps the
# CLI's upgrade prompt out of a release: accepting it replaces the deploy's exit status.
echo "→ Web to Vercel..."
echo "$SHA" > apps/web/.git-sha
trap 'rm -f apps/web/.git-sha' EXIT
NO_UPDATE_NOTIFIER=1 npx vercel --prod --force

live=""
for _ in 1 2 3 4 5 6; do
  live=$(curl -fs -m 10 "$SITE_URL/api/version" || true)
  if [[ "$live" == *"\"$SHA\""* ]]; then break; fi
  sleep 5
done
if [[ "$live" != *"\"$SHA\""* ]]; then
  echo "$SITE_URL reports ${live:-nothing}, expected $SHA. Check the deployment on Vercel." >&2
  exit 1
fi

echo ""
echo "✓ $SHA is live on Convex dev, Convex production and $SITE_URL."
echo "→ iOS: rebuild in Xcode to pick up v$SHA."
