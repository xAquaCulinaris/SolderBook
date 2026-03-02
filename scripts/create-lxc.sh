#!/bin/bash
# Run this script on the Proxmox HOST.
# Downloads the Debian 12 template if needed and creates the SolderBook LXC.
#
# Usage: bash scripts/create-lxc.sh

set -e

# ─── Configuration — adjust to your Proxmox setup ────────────────────────────
LXC_ID=200              # Container ID (change if 200 is already taken)
HOSTNAME="solderbook"
MEMORY=512              # MB
SWAP=512                # MB
CORES=1
DISK=8                  # GB

DISK_STORAGE="local-lvm"   # Storage pool for the rootfs  (check: pvesm status)
TMPL_STORAGE="local"       # Storage pool that holds templates
BRIDGE="vmbr0"             # Network bridge               (check: ip link | grep vmbr)
# ──────────────────────────────────────────────────────────────────────────────

if ! command -v pct &>/dev/null; then
  echo "Error: 'pct' not found. Run this script on the Proxmox host, not inside a container."
  exit 1
fi

echo "=== SolderBook — Create LXC ==="
echo ""

echo "Updating template list..."
pveam update > /dev/null

TEMPLATE=$(pveam available --section system 2>/dev/null \
  | grep "debian-12-standard" \
  | sort -V | tail -1 \
  | awk '{print $2}')

if [ -z "$TEMPLATE" ]; then
  echo "Error: No debian-12-standard template found. Check: pveam available --section system"
  exit 1
fi

echo "Template : $TEMPLATE"

if ! pveam list "$TMPL_STORAGE" 2>/dev/null | grep -q "$TEMPLATE"; then
  echo "Downloading template..."
  pveam download "$TMPL_STORAGE" "$TEMPLATE"
fi

echo "Creating LXC $LXC_ID..."
pct create "$LXC_ID" \
  "$TMPL_STORAGE:vztmpl/$TEMPLATE" \
  --hostname "$HOSTNAME" \
  --memory "$MEMORY" \
  --swap "$SWAP" \
  --cores "$CORES" \
  --rootfs "$DISK_STORAGE:$DISK" \
  --net0 "name=eth0,bridge=$BRIDGE,ip=dhcp" \
  --unprivileged 1 \
  --ostype debian \
  --start 1

echo "Waiting for network..."
sleep 6

LXC_IP=$(pct exec "$LXC_ID" -- hostname -I 2>/dev/null | awk '{print $1}')

echo ""
echo "=== LXC $LXC_ID ready ==="
echo "  IP : ${LXC_IP:-run 'pct exec $LXC_ID -- hostname -I' to find it}"
echo ""
echo "Now run the app setup script inside the container:"
echo ""
echo "  pct push $LXC_ID scripts/setup-app.sh /root/setup-app.sh"
echo "  pct exec $LXC_ID -- bash /root/setup-app.sh"
