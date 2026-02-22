# Implementation Plan Prompt

---

## SYSTEM PROMPT

```
You are a senior software architect and full-stack developer. Your sole task is to produce a complete, actionable implementation plan. Do NOT write any code yet. Every decision must be justified. The plan must be detailed enough that a second developer (using an LLM like Claude Sonnet) can implement it step by step without further clarification. Be concrete: name files, commands, config values, and schema fields explicitly. Avoid vague statements like "implement the database layer" — always say exactly how.
```

---

## USER PROMPT

```
Create a detailed implementation plan for a local web application to manage a console repair business.
The app tracks purchases of broken consoles, repair parts inventory, repair work, and sales — with a dashboard showing profit/loss.

The plan will be handed to Claude Sonnet for implementation, so it must leave zero ambiguity.

---

## Project name

SolderBook

## Business Context

The user buys broken gaming consoles (currently mainly PS4, Xbox One S/X, Nintendo Switch Lite — but this may expand),
repairs them, and resells them. The app should track the full lifecycle of each console and all associated costs.

---

## Functional Requirements

### Console Management
- Add a console with: console type (dynamic, see below), purchase price, optional serial number
- Serial number can be left blank and added/updated later
- Each console has a status:
  - `in_progress` – currently being worked on
  - `sold_repaired` – successfully repaired and sold
  - `sold_unrepaired` – sold without successful repair (may be profit or loss)
  - `parted_out` – kept as parts donor, not sold
- Free-text repair notes field per console (log what was done)
- When closing a console: record whether repair was successful and the sale price (if sold)
- Add costs to a console in two ways:
  1. Assign a spare part from inventory (reduces stock, adds part cost to console)
  2. Add a freeform cost entry (label + amount, e.g. "shipping", "solder wire")

### Spare Parts Inventory
- Add a spare part with: name, unit cost, quantity in stock, compatible console types (multi-select)
- Example: an HDMI port may be compatible with both "PS4 Fat" and "PS4 Slim"
- When a part is assigned to a console, stock decreases by 1
- Parts overview showing current stock levels

### Dynamic Console Types
- Console types are NOT hardcoded
- When a user types a new console type (e.g. "PS4 Fat") for the first time, it is saved
- On subsequent uses, existing types appear as autocomplete/dropdown suggestions
- Console types link consoles to compatible spare parts
- The data model should support future filtering by console type

### Dashboard
- Overall profit/loss across all consoles
- Two views:
  1. Closed consoles only (sold or parted out)
  2. All consoles including in-progress
- Key metrics: total invested capital, total revenue, net profit/loss, console count by status

---

## Deployment Requirements

- **Development:** Runs locally on a laptop, startable from VS Code (launch config or simple terminal command), hot-reload, debug mode
- **Production:** Deployed on a Proxmox server as LXC container or VM, accessible in the local network via IP or hostname, no internet required
- The setup should make switching between dev and production straightforward (e.g. via environment variables or Docker)

---

## What the Plan Must Include

### 1. Technology Stack Decision
Recommend a concrete stack (frontend framework, backend language/framework, database).
Requirements: simple local dev setup, easy Proxmox deployment, long-term extensibility.
Briefly discuss 1–2 alternatives and explain why you chose what you chose.
Preferred direction: something lightweight that doesn't require a heavy build pipeline for a single-developer internal tool.

### 2. Database Schema
Full schema with all tables/collections, field names, data types, and relationships.
Explicitly address:
- How dynamic console types are stored and linked
- How spare part assignments to consoles are tracked (including cost at time of assignment)
- How freeform cost entries are stored
- How status transitions are modeled

### 3. Project Structure
Full folder/file tree of the project.
For each major file or folder, one sentence explaining its purpose.

### 4. API Design (if applicable)
List all API endpoints (or equivalent backend routes) with: method, path, request body, response shape, and purpose.
If using a non-REST approach (e.g. tRPC, GraphQL, server actions), explain the equivalent.

### 5. Frontend Component Structure
List the main pages/views and their key components.
Describe what data each page fetches and what actions it performs.

### 6. Feature Implementation Phases
Break the implementation into ordered milestones. For each phase:
- What is built
- Why in this order (dependencies)
- Acceptance criteria (how do you know it's done)

Suggested phases (adjust as needed):
- Phase 1: Project setup + database + basic console CRUD
- Phase 2: Console lifecycle (status, notes, cost entries)
- Phase 3: Spare parts inventory + assignment to consoles
- Phase 4: Dynamic console types with autocomplete
- Phase 5: Dashboard with profit/loss metrics
- Phase 6: Dev/prod deployment configuration

### 7. VS Code Development Setup
- Required extensions
- `launch.json` configuration for debugging
- `tasks.json` if needed
- Exact terminal commands to install dependencies and start the app
- How to reset/seed the database for development

### 8. Proxmox Deployment Plan
- LXC container vs. VM recommendation with justification
- Step-by-step deployment: OS choice, dependencies, how the app is installed and started
- How to configure network access (static IP or hostname in local network)
- How to persist data (database file or volume)
- How to update the app after changes

### 9. Future Extensibility Notes
Brief notes (not full plans) on how the system could later be extended:
- Filtering/searching consoles by type, status, date
- Export to CSV/PDF
- Multi-user support
- Mobile-friendly improvements

---

Write the plan in English. Be exhaustive and concrete. This document will be used directly as the specification for implementation — treat it as such. 
Save the implementation plan in this folder as a .md file
```