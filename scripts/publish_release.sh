#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/publish_release.sh <version-label> [target-branch]

<version-label>   Version suffix used in the release commit message.
[target-branch]   Branch to switch to after the gh-pages update (default: main).
EOF
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 1
fi

VERSION_LABEL="$1"
TARGET_BRANCH="${2:-main}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This script must be run inside a Git repository." >&2
  exit 1
fi

RELEASE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
PUBLISH_MESSAGE="publish: ${VERSION_LABEL}"

echo "[release] Committing release changes on ${RELEASE_BRANCH}..."
git commit -m "${PUBLISH_MESSAGE}"

echo "[release] Building production bundle..."
npm run build

echo "[release] Pushing ${RELEASE_BRANCH}..."
git push origin "${RELEASE_BRANCH}"

echo "[release] Updating gh-pages branch..."
git checkout gh-pages

if [[ ! -d dist ]]; then
  echo "dist/ not found. Run npm run build before invoking this script." >&2
  exit 1
fi

rm -f index.html vite.svg
rm -rf assets
cp -r dist/. .
rm -rf dist

git add -A

if git diff --cached --quiet; then
  echo "[release] No changes detected on gh-pages."
else
  git commit -m "Update site"
fi

git push origin gh-pages

echo "[release] Switching to ${TARGET_BRANCH}..."
git checkout "${TARGET_BRANCH}"
