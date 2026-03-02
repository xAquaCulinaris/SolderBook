# SolderBook

<img src="static/SolderBook.png" width="192" />

A local web application to manage console repairs: tracking purchases, parts inventory, and sales with profit/loss dashboards.

## Stack

- **SvelteKit 2** — frontend + backend
- **Skeleton UI 2** — Tailwind-based component library
- **SQLite** via **better-sqlite3** — zero-config local database
- **Drizzle ORM** — type-safe schema and queries
- **Node.js 22** — runtime

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env

# 3. Push schema to database (creates SQLite file + tables)
pnpm db:push

# 4. (Optional) Seed with sample data
pnpm db:seed

# 5. Start dev server
pnpm dev
# → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm db:push` | Push schema to SQLite (create/update tables) |
| `pnpm db:studio` | Open Drizzle Studio (DB GUI) |
| `pnpm db:seed` | Seed database with sample data |

## Database Reset

```bash
rm -f data/solderbook.db
pnpm db:push
pnpm db:seed
```

## Production Deployment (Proxmox LXC)

Deployment targets an unprivileged Debian 12 LXC with Node.js 22 and a systemd service.
Scripts are in the `scripts/` directory.

### First deploy

```bash
# 1. On the Proxmox host — edit config vars at the top first, then:
bash scripts/create-lxc.sh

# 2. Push the setup script into the container and run it (replace 200 with your LXC ID)
pct push 200 scripts/setup-app.sh /root/setup-app.sh
pct exec 200 -- bash /root/setup-app.sh
```

`setup-app.sh` handles everything: installs Node.js 22, pnpm, clones the repo, builds the app, runs DB migrations, and starts the systemd service. It prints the URL when done.

### Updating after a new commit

```bash
# SSH into the LXC, then:
bash /opt/solderbook/scripts/update-app.sh
```

### Service commands (inside LXC)

```bash
systemctl status solderbook      # Check status
journalctl -u solderbook -f      # Live logs
systemctl restart solderbook     # Restart
```

## Features

- **Consoles** — Track broken consoles: purchase price, type, serial number, repair notes
- **Parts Inventory** — Track spare parts stock with compatible console types
- **Repair Workflow** — Assign parts to consoles (with cost snapshot), add freeform cost entries
- **Close Console** — Set outcome (sold repaired/unrepaired/parted out) and sale price
- **Dashboard** — Net P/L, total invested, total revenue, status counts
- **Autocomplete** — Console type input auto-suggests existing types; new types created on submit
