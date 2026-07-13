#!/bin/zsh
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/apps/current"
BRANCH="$(git -C "$ROOT" branch --show-current)"
REMOTE_URL="$(git -C "$ROOT" remote get-url origin 2>/dev/null || true)"

fail() {
  echo
  echo "Cannot publish: $1"
  exit 1
}

echo "Guitar Academy publisher"
echo "========================"
echo

command -v git >/dev/null 2>&1 || fail "Git is not installed."
command -v npm >/dev/null 2>&1 || fail "Node.js and npm are not installed."
[ -d "$APP" ] || fail "apps/current could not be found."
[ "$BRANCH" = "main" ] || fail "the current Git branch is '$BRANCH'. Switch to main before publishing."
[ -n "$REMOTE_URL" ] || fail "the GitHub origin remote is not configured."
[ -f "$APP/.env.local" ] || fail "apps/current/.env.local is missing. Follow apps/current/docs/pixel-sync-setup.md first."

if [ -n "$(git -C "$ROOT" diff --name-only --diff-filter=U)" ]; then
  fail "there are unresolved Git conflicts. Resolve them before publishing."
fi

echo "GitHub: $REMOTE_URL"
echo "Live app: https://learn-the-guitar.web.app"
echo
echo "The following repository changes will be included:"
echo
if [ -n "$(git -C "$ROOT" status --porcelain)" ]; then
  git -C "$ROOT" status --short
else
  echo "  No uncommitted changes; the current main branch will be redeployed."
fi
echo
echo "This will verify the app, commit every change shown above, push main to GitHub,"
echo "and let GitHub Actions deploy Firebase Hosting automatically."
echo
printf "Type PUBLISH to continue: "
read -r confirmation
[ "$confirmation" = "PUBLISH" ] || fail "confirmation was not entered."

echo
echo "Checking GitHub for newer work..."
git -C "$ROOT" fetch origin main
if ! git -C "$ROOT" merge-base --is-ancestor origin/main HEAD; then
  fail "GitHub contains work that is not in this checkout. Reconcile it before publishing."
fi

if [ ! -d "$APP/node_modules" ]; then
  echo
  echo "Installing application dependencies..."
  (cd "$APP" && npm ci)
fi

echo
echo "Running music, application, and production checks..."
(cd "$APP" && npm run test && npm run build)

if [ -n "$(git -C "$ROOT" status --porcelain)" ]; then
  git -C "$ROOT" add -A
  git -C "$ROOT" diff --cached --check
  echo
  echo "Creating the release commit..."
  git -C "$ROOT" diff --cached --stat
  commit_message="Publish Guitar Academy $(date '+%Y-%m-%d %H:%M')"
  git -C "$ROOT" commit -m "$commit_message"
else
  echo
  echo "No new commit is needed."
fi

echo
echo "Pushing main to GitHub..."
git -C "$ROOT" push origin main

echo
echo "GitHub has received the release. GitHub Actions is now testing and deploying"
echo "the live site: https://github.com/georgetbarber/cool-pythagoras/actions"
echo "When that run finishes successfully, the live app is updated at:"
echo "https://learn-the-guitar.web.app"
echo "The installed mobile app updates from the same deployment. If it is already open,"
echo "close and reopen it once the service worker has downloaded the new version."
