# SolderBook — Implementation Plan

> A local web application to manage a console repair business: tracking purchases, repairs, parts inventory, and sales with profit/loss dashboards.

---

## 1. Technology Stack Decision

### Chosen Stack

| Layer      | Technology                | Version  |
|------------|---------------------------|----------|
| Frontend   | **SvelteKit**             | 2.x      |
| UI Library | **Skeleton UI** (Svelte)  | 2.x      |
| Backend    | **SvelteKit** (server routes / form actions) | 2.x |
| Database   | **SQLite** via **better-sqlite3** | 11.x |
| ORM        | **Drizzle ORM**           | latest   |
| Runtime    | **Node.js**               | 22 LTS   |
| Package Mgr| **pnpm**                  | 9.x      |

### Why This Stack

1. **SvelteKit** — Single framework covers frontend + backend. No separate API server needed. Server-side rendering (SSR) works out of the box. Hot-reload via Vite. Minimal boilerplate for a single-developer internal tool.
2. **SQLite** — Zero-config, file-based database. Perfect for a single-user local/LAN app. No separate DB server to install or manage. Easy backup (copy one file). Proxmox deployment is trivial.
3. **Drizzle ORM** — Type-safe SQL queries, lightweight, works natively with better-sqlite3. Schema-as-code with migration support. Far simpler than Prisma for SQLite.
4. **Skeleton UI** — Tailwind-based component library for Svelte. Provides polished tables, forms, modals, and autocomplete out of the box, reducing custom CSS work.

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Next.js + Prisma + PostgreSQL** | Heavier setup. PostgreSQL requires a running DB server. Next.js is more complex for this scope. Prisma's SQLite support has quirks. |
| **Flask/Django + HTMX + SQLite** | Viable and lightweight. However, SvelteKit gives better interactivity (autocomplete, real-time dashboard updates) without the complexity of a separate frontend build. Django is overkill for this scope. |
| **Go + Templ + SQLite** | Excellent performance but slower UI iteration. Fewer ready-made UI components. Better suited for CLI tools or high-throughput APIs. |

---

## 2. Database Schema

### Entity-Relationship Overview

```
console_types 1──∞ consoles
console_types ∞──∞ spare_parts  (via spare_part_console_types)
consoles 1──∞ part_assignments
spare_parts 1──∞ part_assignments
consoles 1──∞ cost_entries
```

### Tables

#### `console_types`

| Column       | Type         | Constraints              | Notes                        |
|--------------|--------------|--------------------------|------------------------------|
| `id`         | INTEGER      | PRIMARY KEY AUTOINCREMENT|                              |
| `name`       | TEXT         | NOT NULL, UNIQUE         | e.g. "PS4 Fat", "Switch Lite"|
| `created_at` | TEXT         | NOT NULL DEFAULT (datetime('now')) | ISO 8601 timestamp |

#### `consoles`

| Column          | Type         | Constraints                          | Notes                                     |
|-----------------|--------------|--------------------------------------|-------------------------------------------|
| `id`            | INTEGER      | PRIMARY KEY AUTOINCREMENT            |                                           |
| `console_type_id` | INTEGER   | NOT NULL, FK → console_types(id)     |                                           |
| `serial_number` | TEXT         | NULL                                 | Can be added/updated later                |
| `purchase_price`| REAL         | NOT NULL                             | In EUR (or user's currency), stored as decimal |
| `sale_price`    | REAL         | NULL                                 | Set when console is sold                  |
| `status`        | TEXT         | NOT NULL DEFAULT 'in_progress'       | CHECK(status IN ('in_progress','sold_repaired','sold_unrepaired','parted_out')) |
| `repair_successful` | INTEGER  | NULL                                 | 0 or 1, set when closing                 |
| `repair_notes`  | TEXT         | NULL                                 | Free-text log of repair work              |
| `created_at`    | TEXT         | NOT NULL DEFAULT (datetime('now'))   |                                           |
| `closed_at`     | TEXT         | NULL                                 | Timestamp when status changed from in_progress |

**Indexes:**
- `idx_consoles_status` on `status`
- `idx_consoles_console_type_id` on `console_type_id`

#### `spare_parts`

| Column       | Type         | Constraints              | Notes                         |
|--------------|--------------|--------------------------|-------------------------------|
| `id`         | INTEGER      | PRIMARY KEY AUTOINCREMENT|                               |
| `name`       | TEXT         | NOT NULL                 | e.g. "HDMI Port", "Fan"      |
| `unit_cost`  | REAL         | NOT NULL                 | Cost per unit                 |
| `quantity`   | INTEGER      | NOT NULL DEFAULT 0       | Current stock level           |
| `created_at` | TEXT         | NOT NULL DEFAULT (datetime('now')) |                      |

#### `spare_part_console_types`

Junction table for many-to-many between spare_parts and console_types.

| Column           | Type    | Constraints                        |
|------------------|---------|------------------------------------|
| `spare_part_id`  | INTEGER | NOT NULL, FK → spare_parts(id) ON DELETE CASCADE |
| `console_type_id`| INTEGER | NOT NULL, FK → console_types(id) ON DELETE CASCADE |
| PRIMARY KEY      |         | (spare_part_id, console_type_id)   |

#### `part_assignments`

Records each time a spare part is assigned to a console. Captures cost at time of assignment so historical data stays accurate even if part price changes later.

| Column          | Type    | Constraints                           | Notes                        |
|-----------------|---------|---------------------------------------|------------------------------|
| `id`            | INTEGER | PRIMARY KEY AUTOINCREMENT             |                              |
| `console_id`    | INTEGER | NOT NULL, FK → consoles(id) ON DELETE CASCADE |                      |
| `spare_part_id` | INTEGER | NOT NULL, FK → spare_parts(id)        |                              |
| `cost_at_assignment` | REAL | NOT NULL                            | Snapshot of unit_cost at assignment time |
| `assigned_at`   | TEXT    | NOT NULL DEFAULT (datetime('now'))    |                              |

#### `cost_entries`

Freeform cost items attached to a console.

| Column       | Type    | Constraints                             | Notes                        |
|--------------|---------|-----------------------------------------|------------------------------|
| `id`         | INTEGER | PRIMARY KEY AUTOINCREMENT               |                              |
| `console_id` | INTEGER | NOT NULL, FK → consoles(id) ON DELETE CASCADE |                        |
| `label`      | TEXT    | NOT NULL                                | e.g. "Shipping", "Solder wire" |
| `amount`     | REAL    | NOT NULL                                | Cost in EUR                  |
| `created_at` | TEXT    | NOT NULL DEFAULT (datetime('now'))      |                              |

### How Key Concepts Are Modeled

- **Dynamic console types:** Stored in `console_types`. When a user types a name that doesn't exist yet, a new row is inserted. The UI provides autocomplete from existing rows.
- **Spare part compatibility:** The `spare_part_console_types` junction table allows a part to be compatible with multiple console types. When assigning a part to a console, the UI can filter parts by the console's type.
- **Part assignment cost tracking:** `part_assignments.cost_at_assignment` captures the unit cost at assignment time. This decouples historical repair costs from future price changes.
- **Freeform costs:** `cost_entries` stores arbitrary label+amount pairs per console.
- **Status transitions:** The `status` column uses a CHECK constraint. The app enforces valid transitions in application logic (only `in_progress` → any other status). `closed_at` is set automatically when status changes away from `in_progress`.
- **Total cost of a console:** `purchase_price + SUM(part_assignments.cost_at_assignment) + SUM(cost_entries.amount)`.
- **Profit per console:** `sale_price - total_cost` (only meaningful for sold consoles).

---

## 3. Project Structure

```
SolderBook/
├── README.md                          # Project overview and setup instructions
├── IMPLEMENTATION_PLAN.md             # This file
├── package.json                       # Dependencies and scripts
├── pnpm-lock.yaml                     # Lock file
├── svelte.config.js                   # SvelteKit configuration (adapter-node for production)
├── vite.config.ts                     # Vite dev server config
├── tsconfig.json                      # TypeScript configuration
├── tailwind.config.ts                 # Tailwind + Skeleton theme config
├── postcss.config.js                  # PostCSS for Tailwind
├── drizzle.config.ts                  # Drizzle ORM config (SQLite path, migrations dir)
├── .env                               # Environment variables (DB path, port)
├── .env.example                       # Template for env vars
├── .vscode/
│   ├── launch.json                    # Debug configurations
│   ├── tasks.json                     # Build/dev tasks
│   └── extensions.json                # Recommended extensions
├── drizzle/
│   └── migrations/                    # Auto-generated SQL migration files
├── src/
│   ├── app.html                       # Root HTML shell
│   ├── app.postcss                    # Global styles / Skeleton theme
│   ├── hooks.server.ts                # Server hooks (DB connection lifecycle)
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db.ts                  # Database connection singleton (better-sqlite3)
│   │   │   └── schema.ts             # Drizzle schema definitions (all tables)
│   │   ├── types.ts                   # Shared TypeScript types/interfaces
│   │   └── utils.ts                   # Shared utility functions (currency formatting, etc.)
│   └── routes/
│       ├── +layout.svelte             # Root layout: navigation sidebar/topbar
│       ├── +page.svelte               # Dashboard (home page)
│       ├── +page.server.ts            # Dashboard data loader (metrics queries)
│       ├── consoles/
│       │   ├── +page.svelte           # Console list view
│       │   ├── +page.server.ts        # Load all consoles with summary data
│       │   ├── new/
│       │   │   ├── +page.svelte       # Add new console form
│       │   │   └── +page.server.ts    # Form action: create console
│       │   └── [id]/
│       │       ├── +page.svelte       # Console detail: notes, costs, parts, status
│       │       ├── +page.server.ts    # Load console detail + form actions (update, close, add cost, assign part)
│       │       └── close/
│       │           ├── +page.svelte   # Close/sell console form
│       │           └── +page.server.ts # Form action: close console
│       ├── parts/
│       │   ├── +page.svelte           # Spare parts inventory list
│       │   ├── +page.server.ts        # Load all parts with stock levels
│       │   └── new/
│       │       ├── +page.svelte       # Add new spare part form
│       │       └── +page.server.ts    # Form action: create part
│       └── api/
│           └── console-types/
│               └── +server.ts         # GET endpoint: returns console types for autocomplete (JSON)
├── static/
│   └── favicon.png                    # App favicon
├── Dockerfile                         # Production container build
├── docker-compose.yml                 # Dev + prod compose profiles
└── seed.ts                            # Database seed script for development
```

---

## 4. API Design

SvelteKit uses **form actions** for mutations and **load functions** for data fetching. There is one JSON API endpoint for autocomplete.

### Load Functions (Data Fetching)

| Route                      | Data Returned                                                                 |
|----------------------------|-------------------------------------------------------------------------------|
| `/` (dashboard)            | Total invested, total revenue, net P/L, count by status. Both "closed only" and "all" variants. |
| `/consoles`                | Array of consoles with: id, type name, status, purchase_price, total_cost, sale_price, created_at |
| `/consoles/new`            | List of console types (for autocomplete preload)                              |
| `/consoles/[id]`           | Full console record + part_assignments (with part name) + cost_entries + compatible spare parts in stock |
| `/consoles/[id]/close`     | Console summary (type, total cost so far) for closing form                    |
| `/parts`                   | Array of spare parts with: id, name, unit_cost, quantity, compatible type names |
| `/parts/new`               | List of console types (for multi-select)                                      |

### Form Actions (Mutations)

| Route                      | Action Name           | Fields                                                      | Effect                                                            |
|----------------------------|-----------------------|-------------------------------------------------------------|-------------------------------------------------------------------|
| `/consoles/new`            | `default`             | `console_type` (string), `purchase_price` (number), `serial_number?` (string) | Creates console. If console_type is new, inserts into console_types first. |
| `/consoles/[id]`           | `updateNotes`         | `repair_notes` (string)                                     | Updates repair_notes field                                        |
| `/consoles/[id]`           | `updateSerial`        | `serial_number` (string)                                    | Updates serial_number field                                       |
| `/consoles/[id]`           | `addCost`             | `label` (string), `amount` (number)                         | Inserts into cost_entries                                         |
| `/consoles/[id]`           | `assignPart`          | `spare_part_id` (number)                                    | Inserts into part_assignments (with cost snapshot), decrements spare_parts.quantity. Fails if quantity = 0. |
| `/consoles/[id]/close`     | `default`             | `status` (enum), `sale_price?` (number), `repair_successful` (0\|1) | Sets status, sale_price, repair_successful, closed_at. Validates: sale_price required if sold_repaired or sold_unrepaired. |
| `/parts/new`               | `default`             | `name` (string), `unit_cost` (number), `quantity` (number), `console_type_ids` (number[]) | Inserts spare_part + junction table rows                          |

### JSON API Endpoint

| Method | Path                    | Response                          | Purpose                             |
|--------|-------------------------|-----------------------------------|-------------------------------------|
| GET    | `/api/console-types`    | `{ types: [{ id, name }] }`      | Autocomplete data for console type input fields |

---

## 5. Frontend Component Structure

### Root Layout (`+layout.svelte`)

- Top navigation bar with app name "SolderBook" and links: Dashboard, Consoles, Parts
- Active route highlighting
- Responsive: sidebar on desktop, hamburger menu on mobile

### Page: Dashboard (`/`)

- **Data:** Loads aggregated metrics from `+page.server.ts`
- **Components:**
  - `MetricCard` — Displays a single KPI (total invested, total revenue, net P/L, console count by status)
  - Toggle switch: "Closed only" / "All consoles" — reloads metrics via URL search param `?view=closed` or `?view=all`
  - Summary table of recent consoles (last 10)
- **Metrics shown:**
  - Total invested capital (sum of all purchase prices + parts + costs)
  - Total revenue (sum of sale prices)
  - Net profit/loss (revenue - invested)
  - Console count by status (4 badges)

### Page: Console List (`/consoles`)

- **Data:** All consoles with type name, status badge, purchase price, total cost, sale price
- **Components:**
  - Filterable/sortable table using Skeleton's `Table` component
  - Status badges with color coding: `in_progress` = blue, `sold_repaired` = green, `sold_unrepaired` = orange, `parted_out` = gray
  - "Add Console" button → links to `/consoles/new`
  - Each row clickable → navigates to `/consoles/[id]`

### Page: New Console (`/consoles/new`)

- **Data:** Preloaded console types for autocomplete
- **Components:**
  - `ConsoleTypeInput` — Text input with autocomplete dropdown. On submit, if value doesn't match existing type, server creates new type.
  - `purchase_price` — Number input
  - `serial_number` — Optional text input
  - Submit button

### Page: Console Detail (`/consoles/[id]`)

- **Data:** Full console record, part assignments, cost entries, compatible parts in stock
- **Components:**
  - Header: Console type, status badge, serial number (editable inline)
  - `RepairNotesEditor` — Textarea with save button (form action `updateNotes`)
  - `CostEntriesTable` — Table of freeform costs with "Add Cost" inline form (label + amount)
  - `PartAssignmentsTable` — Table of assigned parts with cost at assignment time
  - `AssignPartForm` — Dropdown of compatible parts in stock + "Assign" button
  - Total cost summary: purchase + parts + costs = total
  - "Close Console" button → links to `/consoles/[id]/close` (only shown if status is `in_progress`)

### Page: Close Console (`/consoles/[id]/close`)

- **Data:** Console summary
- **Components:**
  - Status selector: radio buttons for `sold_repaired`, `sold_unrepaired`, `parted_out`
  - `sale_price` — Number input (shown/required only if status is `sold_repaired` or `sold_unrepaired`)
  - `repair_successful` — Checkbox
  - Confirm button

### Page: Parts Inventory (`/parts`)

- **Data:** All spare parts with stock levels and compatible types
- **Components:**
  - Table: name, unit cost, quantity (with low-stock highlight if quantity ≤ 2), compatible types as tags
  - "Add Part" button → links to `/parts/new`

### Page: New Part (`/parts/new`)

- **Data:** Console types for multi-select
- **Components:**
  - `name` — Text input
  - `unit_cost` — Number input
  - `quantity` — Number input
  - `console_type_ids` — Multi-select checkboxes of existing console types
  - Submit button

---

## 6. Feature Implementation Phases

### Phase 1: Project Setup + Database + Basic Console CRUD

**What is built:**
- Initialize SvelteKit project with TypeScript, Tailwind, Skeleton UI
- Configure Drizzle ORM with SQLite (better-sqlite3)
- Define full database schema in `src/lib/server/schema.ts`
- Run initial migration to create all tables
- Implement `/consoles` list page (read)
- Implement `/consoles/new` page (create console with hardcoded test type)
- Implement `/consoles/[id]` detail page (read only, no actions yet)

**Why first:** Everything depends on the project skeleton and database. Console CRUD is the core entity.

**Acceptance criteria:**
- `pnpm dev` starts the app on `http://localhost:5173`
- Creating a console via the form persists it to SQLite
- Console list shows all consoles from the database
- Console detail page displays all fields
- Database file is created at the configured path

### Phase 2: Console Lifecycle (Status, Notes, Cost Entries)

**What is built:**
- Repair notes editing (form action `updateNotes`)
- Serial number inline editing (form action `updateSerial`)
- Freeform cost entries: add and display (form action `addCost`)
- Close console flow: `/consoles/[id]/close` with status selection, sale price, repair_successful
- Status badges with color coding on list page
- `closed_at` is set automatically on status change

**Why second:** These complete the console lifecycle, which is the core business workflow.

**Acceptance criteria:**
- Can update repair notes and serial number on a console
- Can add freeform cost entries (label + amount) to a console
- Can close a console by setting status, sale price, and repair success
- Closed consoles show correct status badge
- Cannot close an already-closed console (button hidden)
- Total cost displays correctly: purchase_price + sum(cost_entries)

### Phase 3: Spare Parts Inventory + Assignment to Consoles

**What is built:**
- `/parts` list page showing all parts with stock levels
- `/parts/new` page to add a spare part (name, unit cost, quantity, compatible types as multi-select)
- Part assignment on console detail: dropdown of compatible parts (filtered by console type) + assign button
- Stock decrement on assignment
- Part assignments table on console detail (showing part name + cost at assignment)
- Total cost now includes assigned parts

**Why third:** Parts depend on consoles existing. Assignment is the bridge between the two entities.

**Acceptance criteria:**
- Can add spare parts with stock quantity and compatible console types
- Parts list shows current stock levels
- On console detail, only compatible parts appear in the assignment dropdown
- Assigning a part decrements stock by 1
- Assignment fails gracefully if stock is 0
- Console total cost includes assigned part costs (at assignment-time price)

### Phase 4: Dynamic Console Types with Autocomplete

**What is built:**
- `/api/console-types` JSON endpoint
- `ConsoleTypeInput` component with autocomplete (fetches from API endpoint)
- When user types a new type name that doesn't exist, it's created on console submission
- Console types appear in the parts multi-select
- Console list can be filtered by type (URL search param)

**Why fourth:** The autocomplete UX enhancement builds on the existing type system. Earlier phases can use a simple text input or dropdown.

**Acceptance criteria:**
- Typing in the console type field shows matching suggestions
- Selecting an existing type uses its ID
- Typing a new name and submitting creates a new console_type row
- New type immediately appears in future autocomplete suggestions
- Parts form shows all console types in multi-select

### Phase 5: Dashboard with Profit/Loss Metrics

**What is built:**
- Dashboard page (`/`) with metric cards
- SQL queries for: total invested, total revenue, net P/L, count by status
- Toggle between "closed consoles only" and "all consoles" views
- Recent consoles table (last 10)
- Color coding: profit = green, loss = red

**Why fifth:** Dashboard aggregates data from all other features. It must come after all cost-related features are complete.

**Acceptance criteria:**
- Dashboard shows correct total invested capital
- Dashboard shows correct total revenue
- Dashboard shows correct net profit/loss
- Console count by status is accurate
- "Closed only" toggle excludes in_progress consoles from calculations
- "All" toggle includes everything
- Metrics update immediately after closing a console (page reload)

### Phase 6: Dev/Prod Deployment Configuration

**What is built:**
- `.env` / `.env.example` with `DATABASE_PATH`, `PORT`, `NODE_ENV`
- `Dockerfile` using Node.js 22 Alpine, multi-stage build
- `docker-compose.yml` with dev (volume mount, hot reload) and prod (built app) profiles
- VS Code `launch.json` and `tasks.json`
- `seed.ts` script for development data
- README with full setup instructions

**Why last:** The app must be feature-complete before optimizing the deployment pipeline.

**Acceptance criteria:**
- `pnpm dev` works for local development with hot reload
- `docker compose --profile dev up` starts dev environment
- `docker compose --profile prod up` builds and starts production app
- Production build serves on configured port
- Database file persists across container restarts (Docker volume)
- Seed script populates test data

---

## 7. VS Code Development Setup

### Required Extensions

Add to `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

### launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "SolderBook: Dev Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "serverReadyAction": {
        "pattern": "Local:   (https?://[^ ]+)",
        "uriFormat": "%s",
        "action": "openExternally"
      }
    },
    {
      "name": "SolderBook: Debug Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev", "--", "--inspect"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

### tasks.json

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "shell",
      "command": "pnpm dev",
      "group": { "kind": "build", "isDefault": true },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "db:migrate",
      "type": "shell",
      "command": "pnpm drizzle-kit push"
    },
    {
      "label": "db:seed",
      "type": "shell",
      "command": "pnpm tsx seed.ts"
    },
    {
      "label": "build",
      "type": "shell",
      "command": "pnpm build"
    }
  ]
}
```

### Terminal Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env from template
cp .env.example .env

# 3. Push schema to database (creates SQLite file + tables)
pnpm drizzle-kit push

# 4. Seed database with test data (optional)
pnpm tsx seed.ts

# 5. Start development server with hot reload
pnpm dev
# App available at http://localhost:5173
```

### Database Reset for Development

```bash
# Delete the SQLite database file and re-create
rm -f data/solderbook.db
pnpm drizzle-kit push
pnpm tsx seed.ts
```

### .env.example Contents

```env
DATABASE_PATH=./data/solderbook.db
PORT=5173
NODE_ENV=development
```

---

## 8. Proxmox Deployment Plan

### Recommendation: LXC Container

**Why LXC over VM:**
- Lower resource overhead (no full OS virtualization)
- Faster startup
- Sufficient for a Node.js web app with SQLite
- Easy to snapshot and backup
- A VM would be overkill for a single lightweight service

### Step-by-Step Deployment

#### 1. Create LXC Container in Proxmox

- Template: **Debian 12 (Bookworm)** — stable, lightweight, well-supported
- Resources: 1 CPU core, 512 MB RAM, 4 GB disk (generous for SQLite + Node app)
- Network: Bridge to LAN (e.g., `vmbr0`), static IP or DHCP reservation

```bash
# In Proxmox shell — example, adjust CTID and storage
pct create 200 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
  --hostname solderbook \
  --memory 512 \
  --cores 1 \
  --rootfs local-lvm:4 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1
pct start 200
```

#### 2. Install Dependencies Inside LXC

```bash
# Enter the container
pct enter 200

# Update and install Node.js 22
apt update && apt upgrade -y
apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm
```

#### 3. Deploy the Application

```bash
# Create app directory
mkdir -p /opt/solderbook
cd /opt/solderbook

# Option A: Copy built files from dev machine
# On dev machine:
#   pnpm build
#   scp -r build/ package.json pnpm-lock.yaml .env root@<container-ip>:/opt/solderbook/

# Option B: Clone from git (if using a repo)
#   git clone <repo-url> .

# Install production dependencies only
pnpm install --prod

# Create data directory for SQLite
mkdir -p /opt/solderbook/data

# Set up environment
cat > .env << 'EOF'
DATABASE_PATH=/opt/solderbook/data/solderbook.db
PORT=3000
NODE_ENV=production
ORIGIN=http://<container-ip>:3000
EOF

# Push database schema
pnpm drizzle-kit push
```

#### 4. Create Systemd Service

```bash
cat > /etc/systemd/system/solderbook.service << 'EOF'
[Unit]
Description=SolderBook Console Repair Manager
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/solderbook
ExecStart=/usr/bin/node build/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable solderbook
systemctl start solderbook
```

#### 5. Network Access

- The app listens on port 3000 (configured in `.env`)
- Access from any device on the LAN: `http://<container-ip>:3000`
- For a hostname: add a DNS entry in your router or use mDNS, or add to `/etc/hosts` on client machines
- No firewall rules needed inside an unprivileged LXC by default

#### 6. Data Persistence

- SQLite database lives at `/opt/solderbook/data/solderbook.db`
- **Backup strategy:** Proxmox LXC snapshots, or periodically copy the `.db` file:
  ```bash
  cp /opt/solderbook/data/solderbook.db /backup/solderbook-$(date +%F).db
  ```
- The data directory is inside the container's rootfs — persistent across restarts

#### 7. Updating the App

```bash
# On dev machine: build the production bundle
pnpm build

# Copy to container
scp -r build/ package.json pnpm-lock.yaml root@<container-ip>:/opt/solderbook/

# On container: install deps and restart
pct enter 200
cd /opt/solderbook
pnpm install --prod
pnpm drizzle-kit push   # Apply any new migrations
systemctl restart solderbook
```

### Alternative: Docker Inside LXC

If preferred, Docker can run inside a privileged LXC container. This adds a layer but simplifies updates via `docker compose pull && docker compose up -d`. The `Dockerfile` and `docker-compose.yml` from Phase 6 support this.

---

## 9. Future Extensibility Notes

### Filtering/Searching Consoles
- The schema already supports filtering by `status` and `console_type_id` (indexed columns)
- Add URL search params to `/consoles` route: `?status=in_progress&type=3&q=serial`
- SvelteKit's `load` function reads `url.searchParams` and builds the SQL WHERE clause dynamically

### Export to CSV/PDF
- CSV: Use a server endpoint (`/api/export/csv`) that streams query results as CSV with `text/csv` content type. No external library needed.
- PDF: Use `pdfkit` (Node.js) or a browser-side solution like `window.print()` with a print-friendly CSS stylesheet. The print CSS approach is simpler and sufficient for invoices/reports.

### Multi-User Support
- Current architecture (SQLite, no auth) is single-user by design
- To add multi-user: replace SQLite with PostgreSQL, add a `users` table, integrate `lucia-auth` (SvelteKit-compatible auth library), add `user_id` FK to consoles/parts
- SvelteKit's `hooks.server.ts` is already the right place for session validation middleware

### Mobile-Friendly Improvements
- Skeleton UI + Tailwind is responsive by default
- For better mobile UX: convert tables to card layouts on small screens using Tailwind responsive classes (`hidden md:table-cell` for less important columns)
- Consider adding a PWA manifest (`static/manifest.json`) for "Add to Home Screen" on mobile devices — SvelteKit supports this with minimal config

---

*This plan is complete and ready for implementation. Each phase has clear acceptance criteria and can be implemented sequentially by following the specifications above.*
