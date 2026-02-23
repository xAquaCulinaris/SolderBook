# SolderBook — Design & Theme Reference

> This document describes the visual design system for SolderBook. Use it to keep new UI consistent with existing pages.

---

## Design Philosophy

Dark, minimal, dense. The UI is a data-heavy internal tool — aesthetics serve clarity over decoration.

- **Dark theme throughout** — no light-mode variant
- **Purple accent** for primary actions and active states
- **Subtle borders** rather than heavy shadows to separate surfaces
- **Small-caps labels** on form fields for a modern, structured look
- **Color conveys meaning** — green for profit/success, red for loss/error, yellow for warning/caution

---

## Color Palette

All colors come from the custom `solder` theme in `tailwind.config.ts`. Skeleton UI's CSS variable system is used, so Tailwind classes like `bg-surface-900` and `text-primary-500` resolve to these values.

### Primary — Purple (brand / CTA / active)

| Token | Hex | Usage |
|---|---|---|
| `primary-300` | `#D8B4FE` | — |
| `primary-400` | `#C084FC` | Hover states |
| `primary-500` | `#A855F7` | **Main accent** — active nav, focus rings, filled badges, CTA buttons |
| `primary-600` | `#9333EA` | Button hover |
| `primary-700` | `#7E22CE` | Pressed / dark accent |
| `primary-900` | `#581C87` | Shadow tints (`shadow-primary-900/50`) |

### Surface — Zinc (backgrounds, borders, muted text)

| Token | Hex | Usage |
|---|---|---|
| `surface-300` | `#D4D4D8` | Divider lines (`<hr>`) |
| `surface-400` | `#A1A1AA` | Secondary / muted text, label subtitles |
| `surface-500` | `#71717A` | Placeholder text, footer text |
| `surface-600` | `#52525B` | Input borders (use at `/60` opacity) |
| `surface-700` | `#3F3F46` | Sidebar borders, card borders (use at `/40`–`/50` opacity) |
| `surface-800` | `#27272A` | **Card backgrounds**, form card backgrounds (`/50` opacity for slight translucency) |
| `surface-900` | `#18181B` | **Page background**, sidebar background, input field backgrounds |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `success-500` | `#10B981` | Profit, positive P/L, sale price text |
| `warning-500` | `#EAB308` | Low stock badges, "Sold Unrepaired" status badge |
| `error-400` | `#F87171` | Required field asterisks |
| `error-500` | `#EF4444` | Negative P/L, error alerts, zero stock badge, error messages |

### Tertiary — Violet

| Token | Hex | Usage |
|---|---|---|
| `tertiary-500` | `#8B5CF6` | "Close Console" and "Reopen" buttons (`variant-filled-tertiary`) |

---

## Typography

- **Font family:** `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Base color:** white (`255 255 255`) on dark backgrounds
- **Headings:** Skeleton's `h2` / `h4` utility classes
- **Page titles:** `h2` (`class="h2"`)
- **Section headings:** `h4` (`class="h4"`)
- **Muted / secondary text:** `text-surface-400`
- **Small metadata:** `text-sm text-surface-400`, or `text-xs text-surface-500`

### Form Label Style (canonical)

```html
<label class="block text-xs font-semibold uppercase tracking-wider text-surface-400">
  Field Name
</label>
```

This small-caps pattern is the standard for all create/edit form field labels.

---

## Layout

### AppShell

- **Sidebar:** `w-60`, `bg-surface-900`, `border-r border-surface-700/40`
- **Content area:** `p-6 lg:p-8 max-w-7xl`

### Sidebar Anatomy

```
┌─────────────────────┐
│  Logo + brand name  │  px-5 py-5, border-b border-surface-700/40
│  (purple icon box)  │  Icon: bg-primary-500 rounded-xl w-9 h-9
├─────────────────────┤
│  Nav links          │  p-3 space-y-0.5
│  Active: bg-primary-500/15 text-primary-400
│  Idle:   text-surface-300 hover:bg-surface-700/50
├─────────────────────┤
│  Footer             │  text-[11px] text-surface-500
└─────────────────────┘
```

---

## Component Patterns

### Cards

Generic content card (Skeleton default):
```html
<div class="card p-5 space-y-4"> ... </div>
```

**Form card** (create/edit forms — custom style):
```html
<form class="bg-surface-800/50 border border-surface-700/40 rounded-xl p-6 space-y-5">
```
The form card sits slightly above `surface-900` without using `card` class, keeping the border thin and subtle.

### Inputs (custom style — use this on all create/edit forms)

Plain text / number input:
```html
<input
  class="w-full bg-surface-900 border border-surface-600/60 rounded-lg px-4 py-2.5
         text-white placeholder:text-surface-500
         focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
         transition-colors"
/>
```

Currency input (with € prefix):
```html
<div class="relative">
  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium select-none">€</span>
  <input class="... pl-8 pr-4 ..." />
</div>
```

Textarea (repair notes):
```html
<textarea class="textarea w-full" rows="6"></textarea>
```
*(Still uses Skeleton's `textarea` class — acceptable in inline editing contexts.)*

Select dropdowns still use Skeleton's `class="select"`.

### Buttons

| Class | Usage |
|---|---|
| `btn variant-filled-primary` | Primary CTA (Add, Save, Submit) |
| `btn variant-ghost` | Secondary / cancel actions, Back links |
| `btn variant-ghost-primary` | Soft primary (View All) |
| `btn variant-filled-tertiary` | Destructive-ish actions (Close Console, Reopen) |
| `btn btn-sm variant-ghost` | Delete / remove (small, inline) and inline edit / cancel buttons |

### Badges (status & stock)

Console status — defined in `src/lib/types.ts` `STATUS_COLORS`:

| Status | Class | Color | Rationale |
|---|---|---|---|
| `in_progress` | `variant-filled-primary` | Purple filled | Active state, brand color |
| `sold_repaired` | `variant-filled-success` | Green filled | Best outcome — fixed and sold |
| `sold_unrepaired` | `variant-filled-warning` | Yellow filled | Acceptable — sold as-is |
| `parted_out` | `variant-soft-error` | Soft red | Unit consumed/stripped |

Stock level badges on parts:

| Condition | Class |
|---|---|
| `quantity === 0` | `variant-filled-error` |
| `quantity <= 2` | `variant-filled-warning` |
| `quantity > 2` | `variant-ghost-surface` |

### Tables

```html
<div class="table-container">
  <table class="table table-hover"> ... </table>
</div>
```

Compact variant for sub-tables (parts/costs within a detail page): `class="table table-compact"`.

When multiple compact tables on the same page must have visually aligned columns, use `table-fixed w-full` and define widths with `<colgroup>`:
```html
<table class="table table-compact table-fixed w-full">
  <colgroup>
    <col class="w-auto" />   <!-- name/description -->
    <col class="w-28" />     <!-- cost/amount -->
    <col class="w-40" />     <!-- date -->
    <col class="w-12" />     <!-- action button (if present) -->
  </colgroup>
  ...
</table>
```

Rows are clickable where they navigate: `class="cursor-pointer"` + `on:click={() => goto(...)}`.

Muted/secondary cell text: `class="text-surface-400"`.

### Page Headers

Top-level pages (Dashboard, Consoles, Parts) use a plain `h2` headline. Detail/sub pages prefix it with a small muted breadcrumb link (`text-sm text-surface-400 hover:underline`) in a `space-y-1` wrapper. On the console detail page the status badge sits inline next to the headline (`flex items-center gap-3`), with the action button (Close/Reopen) justified to the right on the same row.

### Alerts / Errors

```html
<div class="alert variant-filled-error"><p>{message}</p></div>
```

Inline field error text:
```html
<p class="text-sm text-error-500">{message}</p>
```

### Autocomplete Dropdown (console type input)

```html
<div class="absolute z-10 w-full mt-1 bg-surface-800 border border-surface-600/60 rounded-lg shadow-xl overflow-hidden">
  <button class="w-full text-left px-4 py-2.5 text-sm text-surface-200 hover:bg-primary-500/10 hover:text-white transition-colors">
    Option
  </button>
</div>
```

---

## Spacing Conventions

- Page-level sections: `space-y-6` or `space-y-8`
- Form fields within a card: `space-y-5`
- Field group (label + input): `space-y-1.5`
- Cards in a grid: `gap-4`
- Inline button groups: `gap-2` or `gap-3`

---

## P/L Color Convention

Profit/loss values use a consistent pattern:
```svelte
<span class="{value >= 0 ? 'text-success-500' : 'text-error-500'}">
  {formatCurrency(value)}
</span>
```
