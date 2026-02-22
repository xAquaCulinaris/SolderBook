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

```
SolderBook/
├── CLAUDE.md                          # This file
├── IMPLEMENTATION_PLAN.md             # Full spec (schema, API, phases, deployment)
├── README.md                          # Setup instructions
├── package.json
├── pnpm-lock.yaml
├── svelte.config.js                   # vitePreprocess from @sveltejs/vite-plugin-svelte
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts                 # Skeleton UI tw-plugin with 'skeleton' theme
├── postcss.config.js
├── drizzle.config.ts                  # SQLite path from DATABASE_PATH env var
├── .env                               # DATABASE_PATH, PORT, NODE_ENV
├── .env.example
├── .nvmrc                             # Node 22
├── seed.ts                            # Dev data seeder (pnpm db:seed)
├── Dockerfile
├── docker-compose.yml                 # dev + prod profiles
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
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
        ├── +layout.svelte             # AppShell + AppBar nav (Dashboard / Consoles / Parts)
        ├── +page.svelte               # Dashboard
        ├── +page.server.ts            # Dashboard metrics queries
        ├── consoles/
        │   ├── +page.svelte           # Console list with status/type filters
        │   ├── +page.server.ts
        │   ├── new/                   # Add console (autocomplete type input)
        │   └── [id]/
        │       ├── +page.svelte       # Console detail (notes, parts, costs, summary)
        │       ├── +page.server.ts    # Actions: updateNotes, updateSerial, addCost, assignPart, deleteCost
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
- **`consoles`** — Core entity. Status enum: `in_progress | sold_repaired | sold_unrepaired | parted_out`
- **`spare_parts`** — Parts inventory with `unit_cost` and `quantity`
- **`spare_part_console_types`** — Junction table (part ↔ console type compatibility)
- **`part_assignments`** — Part assigned to console; stores `cost_at_assignment` snapshot
- **`cost_entries`** — Freeform label + amount costs per console

### Key business logic

- **Total cost** = `purchase_price + SUM(part_assignments.cost_at_assignment) + SUM(cost_entries.amount)`
- **Profit/loss** = `sale_price - total_cost` (only for sold consoles)
- **Status transitions** — only `in_progress` consoles can be closed; `closed_at` is set on transition
- **Stock** — decremented atomically with part assignment in a DB transaction; assignment fails if `quantity = 0`
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
```

---

## Known Setup Notes

- **Node.js 22 required** — managed via `fnm`. System has Node 18 which is too old for `@sveltejs/vite-plugin-svelte` 6.x.
- **better-sqlite3** — requires native compilation. Configured in `package.json` under `pnpm.onlyBuiltDependencies`. Run `pnpm rebuild better-sqlite3` after switching Node versions.
- **drizzle.config.ts** — does not import `dotenv`; drizzle-kit reads `.env` automatically.
- **svelte.config.js** — imports `vitePreprocess` from `@sveltejs/vite-plugin-svelte`, not `@sveltejs/kit/vite`.
