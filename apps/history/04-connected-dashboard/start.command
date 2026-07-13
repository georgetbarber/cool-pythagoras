#!/bin/bash
set -e
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are required. Install Node.js 20 or newer, then try again."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing iteration 04 dependencies..."
  npm install
fi

exec npm run dev -- --host 127.0.0.1
