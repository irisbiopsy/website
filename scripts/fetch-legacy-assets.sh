#!/usr/bin/env bash
# Copies the IR survey page (and the original step images) from the CURRENT irisbiopsy.com
# into this repo. Run it once from the repo root BEFORE you point DNS at Vercel,
# because the old host stops serving these files after the switch.
#
#   bash scripts/fetch-legacy-assets.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

OLD="https://www.irisbiopsy.com"
mkdir -p legacy

fetch() {
  local url="$1" out="$2"
  if curl -fsSL "$url" -o "$out"; then
    echo "  saved  $out"
  else
    echo "  FAILED $url" >&2
  fi
}

echo "IR survey page (review before publishing; it may reference other files)"
fetch "$OLD/survey.html" "survey.html"

echo "Original step images and hero animation (kept for reference, not used by the new page)"
fetch "$OLD/IRIS%201.png"           "legacy/IRIS-1.png"
fetch "$OLD/IRIS%202.png"           "legacy/IRIS-2.png"
fetch "$OLD/IRIS%203.png"           "legacy/IRIS-3.png"
fetch "$OLD/IRIS%20Hero%20GIF.gif"  "legacy/IRIS-hero.gif"

echo "Done. Commit the new files: git add -A && git commit -m \"Add assets from previous site\""
