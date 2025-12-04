#!/usr/bin/env bash
# Simple deploy helper: runs smoke tests and then vercel --prod
set -euo pipefail
echo "Running smoke tests..."
python3 tests/smoke_test.py
echo "Opening pa11y check (this may take a moment)..."
npx -y pa11y http://localhost:8000 || true
echo "If the checks passed, proceed to deploy with Vercel CLI."
if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi
read -p "Deploy to Vercel now? (y/N) " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
  vercel --prod
else
  echo "Aborted. Run 'vercel --prod' when ready."
fi
