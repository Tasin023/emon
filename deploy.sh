#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

GH_USER="tasin023"   # your GitHub username
REPO_NAME="emon"     # your repo name
EXPECTED_REMOTE="https://github.com/${GH_USER}/${REPO_NAME}.git"

echo "Building with base path /${REPO_NAME}/ ..."
GH_BASE="/${REPO_NAME}/" npm run build

# GitHub Pages SPA fallback: serve the app for unknown URLs
cp dist/index.html dist/404.html

# git: init + commit (safe to re-run)
if [ ! -d .git ]; then
  git init
  git branch -M main
fi
git add -A
git commit -m "update portfolio" || true

# remote: add it, or fix it if it points somewhere else
if git remote get-url origin >/dev/null 2>&1; then
  if [ "$(git remote get-url origin)" != "$EXPECTED_REMOTE" ]; then
    git remote set-url origin "$EXPECTED_REMOTE"
    echo "Updated remote to $EXPECTED_REMOTE"
  fi
else
  git remote add origin "$EXPECTED_REMOTE"
fi

if ! git push -u origin main; then
  echo ""
  echo "Push failed. If the error mentions 'rejected' or 'non-fast-forward',"
  echo "the repo on GitHub probably isn't empty. Run this, then retry:"
  echo "   git push -u origin main --force"
  exit 1
fi

# publish dist/ to the gh-pages branch
npx gh-pages -d dist -m "deploy"

echo ""
echo "Done! Your site: https://${GH_USER}.github.io/${REPO_NAME}/"
echo "(Enable Pages once — see instructions — then it's live in 1-3 minutes.)"
