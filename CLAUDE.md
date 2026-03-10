# SolderBook — Project Context for Claude

## Purpose

SolderBook is a local web application to manage a console repair business. It tracks:

- Broken consoles purchased for repair (purchase price, type, serial number)
- Repair work (notes, parts used, miscellaneous costs)
- Console outcomes (sold repaired, sold unrepaired, parted out, with sale price)
- Spare parts inventory (stock levels, unit costs, compatible console types)
- Profit/loss per console and aggregate dashboard metrics

Single-user, LAN-accessible, runs on a Proxmox LXC container.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | SvelteKit | 2.x |
| UI Library | Skeleton UI | 2.x (Tailwind-based) |
| Database | SQLite via better-sqlite3 | 11.x |
| ORM | Drizzle ORM | 0.40.x |
| Runtime | Node.js | 22 LTS (via fnm) |
| Package Manager | pnpm | 10.x |
| Build Tool | Vite | 6.x |

**Note:** The plan specified Svelte 4 but Svelte 5 is used (required by @sveltejs/kit 2.53+). Skeleton UI 2.x components work under Svelte 5's backward-compatibility mode. Svelte 4 component syntax (`export let`, `on:click`, `$:`) is used throughout — no Svelte 5 runes.

---

## Project Structure

> **Maintenance rule:** Whenever files are added, moved, or removed, update this section to reflect the change. This keeps the structure accurate for future sessions and agents.

```
SolderBook/
├── CLAUDE.md                          # This file — project context for Claude
├── README.md                          # Setup instructions
├── package.json
├── pnpm-lock.yaml
├── svelte.config.js                   # vitePreprocess from @sveltejs/vite-plugin-svelte
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts                 # Skeleton UI tw-plugin with custom 'solder' theme
├── postcss.config.js
├── drizzle.config.ts                  # SQLite path from DATABASE_PATH env var
├── .env                               # DATABASE_PATH, PORT, NODE_ENV
├── .env.example
├── .nvmrc                             # Node 22
├── seed.ts                            # Dev data seeder (pnpm db:seed)
├── Dockerfile
├── docker-compose.yml                 # dev + prod profiles
├── scripts/                           # Deployment scripts (Proxmox LXC)
│   ├── create-lxc.sh                 # Run on Proxmox host — creates the LXC
│   ├── setup-app.sh                  # Run inside LXC — installs app from git
│   └── update-app.sh                 # Run inside LXC — git pull + rebuild
├── docs/                              # Project documentation
│   ├── DESIGN.md                      # Visual design system (colors, components, patterns)
│   ├── IMPLEMENTATION_PLAN.md         # Full spec (schema, API, phases, deployment)
│   └── implementation_plan_prompt.md  # Original prompt used to generate the plan
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
├── static/                            # Static assets served at root
│   ├── SolderBook.png                # Full logo (used in README)
│   └── SolderBook_icon.png           # Icon (used in sidebar top-left)
├── drizzle/migrations/                # Auto-generated SQL migrations
├── data/                              # SQLite database file (gitignored)
│   └── solderbook.db
└── src/
    ├── app.html                       # data-theme="skeleton" on body
    ├── app.postcss                    # Tailwind directives
    ├── hooks.server.ts
    ├── lib/
    │   ├── server/
    │   │   ├── db.ts                  # Drizzle singleton (WAL mode, FK enforcement)
    │   │   └── schema.ts              # All tables + Drizzle relations
    │   ├── types.ts                   # ConsoleStatus, STATUS_LABELS, STATUS_COLORS
    │   └── utils.ts                   # formatCurrency, formatDate, formatDatetime
    └── routes/
        ├── +layout.svelte             # AppShell + sidebar nav (Dashboard / Consoles / Parts)
        ├── +page.svelte               # Dashboard
        ├── +page.server.ts            # Dashboard metrics queries
        ├── consoles/
        │   ├── +page.svelte           # Console list with status/type filters
        │   ├── +page.server.ts
        │   ├── new/                   # Add console (autocomplete type input)
        │   └── [id]/
        │       ├── +page.svelte       # Console detail (notes, parts, costs, summary)
        │       ├── +page.server.ts    # Actions: updateNotes, updateSerial, addCost, assignPart, deleteAssignment, deleteCost, toggleModded, reopen
        │       └── close/             # Close console (status, sale price, repair_successful)
        ├── parts/
        │   ├── +page.svelte           # Parts inventory with stock level badges
        │   ├── +page.server.ts
        │   └── new/                   # Add part (name, cost, quantity, compatible types)
        └── api/
            └── console-types/
                └── +server.ts         # GET → { types: [{id, name}] } for autocomplete
```

---

## Database Schema

```
console_types  1──∞  consoles
console_types  ∞──∞  spare_parts  (via spare_part_console_types)
consoles       1──∞  part_assignments
spare_parts    1──∞  part_assignments
consoles       1──∞  cost_entries
```

### Tables

- **`console_types`** — Dynamic console types (PS4 Fat, Switch Lite, etc.)
- **`consoles`** — Core entity. Status enum: `in_progress | sold_repaired | sold_unrepaired | parted_out`. `is_modded` integer flag (0/1) tracks whether a console has been modded.
- **`spare_parts`** — Parts inventory with `unit_cost`, `quantity`, and `part_type` (`'spare'` or `'mod'`)
- **`spare_part_console_types`** — Junction table (part ↔ console type compatibility)
- **`part_assignments`** — Part assigned to console; stores `cost_at_assignment` snapshot
- **`cost_entries`** — Freeform label + amount costs per console

### Key business logic

- **Total cost** = `purchase_price + SUM(part_assignments.cost_at_assignment) + SUM(cost_entries.amount)`
- **Profit/loss** = `sale_price - total_cost` (only for sold consoles)
- **Status transitions** — only `in_progress` consoles can be closed; `closed_at` is set on transition. Closed consoles can be reopened (`reopen` action), which clears `closed_at`, `sale_price`, and `repair_successful`.
- **Stock** — decremented atomically with part assignment in a DB transaction; incremented back on removal. Assignment fails if `quantity = 0`.
- **Cost snapshot** — `cost_at_assignment` decouples historical repair costs from future price changes

---

## Common Commands

```bash
pnpm dev          # Start dev server → http://localhost:5173
pnpm build        # Production build
pnpm db:push      # Push schema to SQLite (create/update tables)
pnpm db:seed      # Seed with sample data
pnpm db:studio    # Open Drizzle Studio (DB GUI)
```

## Environment Variables

```env
DATABASE_PATH=./data/solderbook.db
PORT=3000
NODE_ENV=development
ORIGIN=http://<host>:3000   # Required in production (SvelteKit CSRF protection)
```

---

## Deployment (Proxmox LXC)

Production target: unprivileged Debian 12 LXC, Node.js 22 via NodeSource, systemd service.
Source is cloned from `https://github.com/xAquaCulinaris/SolderBook`.

### Scripts

| Script | Where to run | Purpose |
|---|---|---|
| `scripts/create-lxc.sh` | Proxmox host | Creates the Debian 12 LXC |
| `scripts/setup-app.sh` | Inside LXC | Full install: Node, pnpm, git clone, build, systemd |
| `scripts/update-app.sh` | Inside LXC | `git pull` + rebuild + restart |

### First deploy

```bash
# 1. On Proxmox host — create the container
bash scripts/create-lxc.sh

# 2. Push setup script into the container and run it (replace 200 with your LXC ID)
pct push 200 scripts/setup-app.sh /root/setup-app.sh
pct exec 200 -- bash /root/setup-app.sh
```

### Updating

```bash
# SSH into the LXC, then:
bash /opt/solderbook/scripts/update-app.sh
```

### Useful service commands (inside LXC)

```bash
systemctl status solderbook      # Check status
journalctl -u solderbook -f      # Live logs
systemctl restart solderbook     # Restart
```

### create-lxc.sh config variables

Edit the top of `scripts/create-lxc.sh` to match your Proxmox setup:

| Variable | Default | Description |
|---|---|---|
| `LXC_ID` | `200` | Proxmox container ID |
| `DISK_STORAGE` | `local-lvm` | Storage pool for rootfs (`pvesm status`) |
| `TMPL_STORAGE` | `local` | Storage pool for templates |
| `BRIDGE` | `vmbr0` | Network bridge (`ip link \| grep vmbr`) |

---

## Design System

See **`docs/DESIGN.md`** for the full visual design reference, including:
- Color palette with hex codes and usage rules
- Form input patterns (custom dark-style inputs, label conventions)
- Component patterns (cards, buttons, badges, tables, dropdowns)
- Status color mappings for console statuses and stock levels
- Spacing and typography conventions

When building new UI, follow the patterns in `DESIGN.md` to stay consistent.

---

## Known Setup Notes

- **Node.js 22 required** — managed via `fnm`. System has Node 18 which is too old for `@sveltejs/vite-plugin-svelte` 6.x.
- **better-sqlite3** — requires native compilation. Configured in `package.json` under `pnpm.onlyBuiltDependencies`. Run `pnpm rebuild better-sqlite3` after switching Node versions.
- **drizzle.config.ts** — does not import `dotenv`; drizzle-kit reads `.env` automatically.
- **svelte.config.js** — imports `vitePreprocess` from `@sveltejs/vite-plugin-svelte`, not `@sveltejs/kit/vite`.
