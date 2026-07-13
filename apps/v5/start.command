#!/bin/bash
set -e
cd "$(dirname "$0")"

NODE="/Users/AI_User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ ! -x "$NODE" ]; then
  NODE="$(command -v node)"
fi

"$NODE" node_modules/vite/bin/vite.js --host 127.0.0.1
