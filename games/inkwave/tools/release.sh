#!/bin/sh
# Rebuild dist/ and deploy it to the Vercel project "inkwave" (production). Only run when asked to deploy.
set -e
cd "$(dirname "$0")/.."
python3 tools/build-dist.py
cd dist && vercel deploy --prod --yes
