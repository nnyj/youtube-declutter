#!/usr/bin/env bash
# Syntax-checks the scripts, then copies src/ to dist/. Run from the repo root.
set -euo pipefail

cd "$(dirname "$0")/.."

# Isolated-world scripts share one scope, so checking them concatenated in manifest order also catches duplicate top-level names.
isolated_scripts=$(node -e '
  const manifest = require("./src/manifest.json");
  const entry = manifest.content_scripts.find((script) => script.world !== "MAIN");
  console.log(entry.js.map((file) => "src/" + file).join("\n"));
')
bundle=dist_check_bundle.js
trap 'rm -f "$bundle"' EXIT
# shellcheck disable=SC2086
cat $isolated_scripts > "$bundle"
node --check "$bundle"

for file in src/background.js src/content/playlist_block.js; do
  node --check "$file"
done

rm -rf dist
cp -r src dist
echo "built dist/"
