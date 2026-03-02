#!/bin/bash
# Run this script INSIDE the LXC to pull the latest code and redeploy.
#
# Usage: bash /opt/solderbook/scripts/update-app.sh

set -e

APP_DIR="/opt/solderbook"

echo "=== SolderBook — Update ==="
echo ""

cd "$APP_DIR"

echo "Pulling latest code..."
git pull

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building..."
pnpm build

echo "Running migrations..."
pnpm db:push

echo "Restarting service..."
systemctl restart solderbook

echo ""
echo "Done. Status: $(systemctl is-active solderbook)"
