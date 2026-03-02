#!/bin/bash
# Run this script INSIDE the LXC (as root).
# Installs Node.js 22, pnpm, clones the app from git, and creates a systemd service.
#
# Usage from Proxmox host:
#   pct push <ID> scripts/setup-app.sh /root/setup-app.sh
#   pct exec <ID> -- bash /root/setup-app.sh

set -e

GIT_REPO="https://github.com/xAquaCulinaris/SolderBook"
APP_DIR="/opt/solderbook"
DATA_DIR="$APP_DIR/data"
PORT=3000

echo "=== SolderBook — App Setup ==="
echo ""

# ── 1. System packages ───────────────────────────────────────────────────────
echo "[1/7] Installing system packages..."
apt-get update -qq
apt-get install -y -qq curl git build-essential python3

# ── 2. Node.js 22 via NodeSource ─────────────────────────────────────────────
echo "[2/7] Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null
apt-get install -y -qq nodejs
echo "      Node $(node -v)  |  npm $(npm -v)"

# ── 3. pnpm ──────────────────────────────────────────────────────────────────
echo "[3/7] Installing pnpm..."
npm install -g pnpm --silent
echo "      pnpm $(pnpm -v)"

# ── 4. Clone repo ─────────────────────────────────────────────────────────────
echo "[4/7] Cloning repository..."
git clone "$GIT_REPO" "$APP_DIR"
mkdir -p "$DATA_DIR"

# ── 5. .env ───────────────────────────────────────────────────────────────────
echo "[5/7] Configuring environment..."
cd "$APP_DIR"
LAN_IP=$(hostname -I | awk '{print $1}')
cat > .env << EOF
DATABASE_PATH=$DATA_DIR/solderbook.db
PORT=$PORT
NODE_ENV=production
ORIGIN=http://$LAN_IP:$PORT
EOF
echo "      ORIGIN=http://$LAN_IP:$PORT"

# ── 6. Install, build, migrate ───────────────────────────────────────────────
echo "[6/7] Installing dependencies and building..."
pnpm install --frozen-lockfile
pnpm build
echo "      Running database migrations..."
pnpm db:push

# ── 7. Systemd service ────────────────────────────────────────────────────────
echo "[7/7] Creating systemd service..."
cat > /etc/systemd/system/solderbook.service << EOF
[Unit]
Description=SolderBook Console Repair Manager
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node $APP_DIR/build/index.js
Restart=on-failure
RestartSec=5
EnvironmentFile=$APP_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now solderbook

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "=== Setup complete! ==="
echo ""
echo "  App URL : http://$LAN_IP:$PORT"
echo ""
echo "Useful commands:"
echo "  systemctl status solderbook      # Service status"
echo "  journalctl -u solderbook -f      # Live logs"
echo "  systemctl restart solderbook     # Restart"
