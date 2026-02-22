# SolderBook

A local web application to manage a console repair business: tracking purchases, repairs, parts inventory, and sales with profit/loss dashboards.

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

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md#8-proxmox-deployment-plan) for full LXC deployment instructions.

**Quick summary:**
1. Create Debian 12 LXC container
2. Install Node.js 22 + pnpm
3. Copy built files: `pnpm build`
4. Create `.env` with `DATABASE_PATH=/opt/solderbook/data/solderbook.db` and `PORT=3000`
5. Run `pnpm db:push` to create tables
6. Set up systemd service

## Docker

```bash
# Development
docker compose --profile dev up

# Production
docker compose --profile prod up --build
```

## Features

- **Consoles** — Track broken consoles: purchase price, type, serial number, repair notes
- **Parts Inventory** — Track spare parts stock with compatible console types
- **Repair Workflow** — Assign parts to consoles (with cost snapshot), add freeform cost entries
- **Close Console** — Set outcome (sold repaired/unrepaired/parted out) and sale price
- **Dashboard** — Net P/L, total invested, total revenue, status counts
- **Autocomplete** — Console type input auto-suggests existing types; new types created on submit
