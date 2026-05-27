# Reading Pal App (React + Dexie.js)

## Overview

A **React** single-page application (SPA) designed to be **100% self-contained**: it runs
locally in the browser with **no external services**, using **Dexie.js** (an IndexedDB wrapper)
as the local database. Data persists automatically across sessions without any export step.

## Purpose

A local app to:

- Manage a library of books (title, author, status, cover)
- Log reading sessions (progress, duration, notes)
- Save quotes (text, tags, favorite, page)
- Rate and rank books (1–5 stars, optional review)

## Hard Constraints

- No remote backend (no Firebase, no Supabase, no external APIs).
- No cloud storage.
- Runs entirely in the browser as a pure web SPA.
- Data is persisted automatically by Dexie.js via the browser's IndexedDB — no manual export
  required for normal use.

---

## Stack

| Layer | Choice |
|---|---|
| UI framework | React 18 + TypeScript (`strict: true`) |
| Routing | React Router v6 |
| Component library | Material UI (MUI) v5 |
| State management | Zustand (UI state only — see [Zustand scope](#zustand-scope); Dexie is source of truth) |
| Local database | Dexie.js v4 + **dexie-react-hooks** (`useLiveQuery`) |
| Forms | React Hook Form |
| Build tool | Vite |
| Test runner | Vitest + React Testing Library + **fake-indexeddb** |

---

## Local Database: Dexie.js

Dexie.js wraps the browser's built-in IndexedDB. No installation of external services is needed.

### Why Dexie over the HBase-inspired model

- Data persists across browser sessions automatically — no refresh data loss.
- TypeScript-first: each table is typed to its entity interface.
- Indexes are declared in the schema and maintained automatically — no manual `quotesByBook` maps.
- Reactive queries (`liveQuery`) integrate directly with React hooks.
- Export/import to JSON is straightforward for snapshot portability.

### Schema (Dexie table definitions)

```typescript
class ReadingPalDB extends Dexie {
  books!: Table<Book>;
  sessions!: Table<ReadingSession>;
  quotes!: Table<Quote>;
  ratings!: Table<Rating>;

  constructor() {
    super('ReadingPalDB');
    this.version(1).stores({
      books:    '++id, status, title, author, createdAt',
      sessions: '++id, bookId, startedAt',
      quotes:   '++id, bookId, isFavorite, *tags',
      ratings:  'bookId',           // bookId is primary key (one rating per book)
    });
  }
}
```

Dexie handles all index maintenance. Secondary lookups (`quotes by bookId`, `books by status`)
are native queries, not hand-rolled Maps.

---

## Zustand Scope

Zustand manages only ephemeral UI state. Dexie + `useLiveQuery` is the source of truth for all persisted data.

Zustand stores:

| Slice | State |
|---|---|
| `libraryUiStore` | active filter chip (`all \| reading \| want_to_read \| finished`), active sort (`recent \| title \| author`) |
| `searchStore` | global search query string, search panel open/closed |
| `uiStore` | any modal / dialog open flags not owned by a specific route |

Everything else (books, sessions, quotes, ratings) is read directly via `useLiveQuery`.

---

## Domain Model

### Book

```typescript
interface Book {
  id?: number;
  title: string;
  author: string;
  status: 'WANT_TO_READ' | 'READING' | 'FINISHED';
  cover?: string;        // base64 data URL (optional)
  currentProgress: number; // 0–100 percentage
  createdAt: number;     // Unix timestamp
  updatedAt: number;
}
```

### ReadingSession

```typescript
interface ReadingSession {
  id?: number;
  bookId: number;
  startedAt: number;       // Unix timestamp
  durationMinutes: number;
  progressDelta: number;   // percentage points added (0–100)
  notes?: string;
}
```

### Quote

```typescript
interface Quote {
  id?: number;
  bookId: number;
  text: string;
  pageNumber?: number;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
}
```

### Rating

```typescript
interface Rating {
  bookId: number;          // primary key — one rating per book
  stars: number;           // 1–5
  review?: string;
  ratedAt: number;
}
```

---

## Key Functional Rules

### Progress

- Progress is stored as a **percentage** (integer 0–100) on the `Book` entity.
- Each `ReadingSession` records a `progressDelta` (how many percentage points were added).
- On session save, the repository computes: `currentProgress = Math.min(100, book.currentProgress + progressDelta)`.
- A book is automatically set to `FINISHED` when the resulting `currentProgress >= 100`.

### Covers

- Covers are stored as base64 data URLs (optional — a placeholder is shown when absent).
- Recommended max upload size: 1 MB per image (enforced client-side before storing).
- Base64 is chosen over raw `Blob` storage intentionally: it makes JSON snapshot export/import trivial. The trade-off is higher IndexedDB size (~1.33× the original file). At 200 books × 1 MB each, this can approach ~270 MB — acceptable for a personal local app.
- Thumbnail generation for the grid view is handled by CSS `object-fit`, not canvas.

### Quote Search

- Filter by `bookId` (Dexie index).
- Filter by `isFavorite` (Dexie index).
- Filter by tag (Dexie multi-entry index on `*tags`).
- Full-text search: case-insensitive `String.includes()` across `quote.text`.

### Tag Autocomplete

- Tag autocomplete in the Add Quote form is scoped to **the current book only** (not global).
- The suggestion list is derived from all existing quotes for that `bookId` via `useLiveQuery`.

---

## Navigation & Screen Map

```
/ (Library)
  └── /books/new             (Add Book)
  └── /books/:id             (Book Detail)
        └── /books/:id/edit  (Edit Book)
        └── tab: Progress
        └── tab: Sessions
              └── /books/:id/sessions/new  (Log Session)
        └── tab: Quotes
        └── tab: Rating
/ranking                     (Global ranked list)
/settings                    (Snapshot export / import)
```

### Navigation Model

- **Top app bar**: app name/logo + settings icon. *(Global search is out of scope for v1 — see Out of Scope.)*
- **Library** is the default route (`/`).
- **Book Detail** opens via card click; uses tabs for sub-sections.
- **Ranking** is a top-level nav item.
- **Settings** is accessible via the top bar icon (snapshot export/import lives here).

### Tab Routing (Book Detail)

Active tab is stored in a URL query parameter: `/books/:id?tab=progress` (default), `?tab=sessions`, `?tab=quotes`, `?tab=rating`. This keeps the browser back button and shareable links working without nested routes.

---

## Screens

### 1. Library (`/`)

- Cover grid (responsive: 4 cols desktop / 2 tablet / 1 mobile).
- Filter chips: All / Reading / Want to Read / Finished.
- Sort: Recent, Title A–Z, Author A–Z.
- FAB (floating action button): "Add book".
- Empty state: illustration + "Add your first book" CTA.

### 2. Book Detail (`/books/:id`)

- Header: cover thumbnail, title, author, status badge, current progress bar.
- Tabs: **Progress** | **Sessions** | **Quotes** | **Rating**.
- **Progress tab**: progress percentage, "Log Session" shortcut button.
- **Sessions tab**: chronological list of sessions; each shows date, duration, delta, notes.
- **Quotes tab**: quote list with tag chips, favorite toggle, search bar.
- **Rating tab**: star selector (1–5) + optional review textarea.

### 3. Add / Edit Book (`/books/new`, `/books/:id/edit`)

- Fields: title (required), author (required), status (required), cover (optional file upload).
- Cover: click-to-upload or drag-and-drop; max 1 MB; preview shown immediately.
- Status defaults to `WANT_TO_READ` on add.

### 4. Log Reading Session (`/books/:id/sessions/new`)

- Fields: date (defaults today), duration in minutes, progress delta (%), optional notes.
- On save: updates `book.currentProgress`; triggers FINISHED transition if >= 100.

### 5. Quotes (inside Book Detail tab)

- List with text, page number (if set), tags, favorite icon.
- "Add Quote" FAB opens an inline form (not a separate route): text, page, tags, favorite toggle.
- Tag input: free-text with comma separation; autocomplete from existing tags for that book.

### 6. Ranking (`/ranking`)

- Displays all rated books sorted by stars desc.
- Secondary view toggle: "Recently Finished".
- Each card: cover, title, author, star rating.
- Unrated books are excluded.

### 7. Settings (`/settings`)

- **Export snapshot**: serializes all Dexie tables to a single JSON file → triggers download.
- **Import snapshot**: file picker for a previously exported JSON → confirms overwrite → rebuilds DB.
- Warning shown before import: "This will replace all current data."

---

## Loading States

`useLiveQuery` returns `undefined` on the first render while the IndexedDB query resolves. Every list and detail view must handle this:

| View | Loading UI |
|---|---|
| Library grid | Skeleton cards (matching the cover grid layout) |
| Book Detail header | Skeleton for cover, title, author, progress bar |
| Sessions list | Skeleton rows |
| Quotes list | Skeleton rows |
| Ranking list | Skeleton cards |

Use MUI `<Skeleton>` components. Do not show an empty state while `useLiveQuery` returns `undefined` — only show empty states when the query resolves to an empty array.

---

## Empty States

| Screen | Empty state message | CTA |
|---|---|---|
| Library (no books) | "Your library is empty" | "Add your first book" |
| Sessions tab (no sessions) | "No sessions logged yet" | "Log a session" |
| Quotes tab (no quotes) | "No quotes saved yet" | "Add a quote" |
| Rating tab (not rated) | "You haven't rated this book" | Star selector shown directly |
| Ranking (no rated books) | "Rate some books to see your ranking" | Link to Library |

---

## Persistence & Snapshot

- **Primary persistence**: Dexie.js / IndexedDB — automatic, no user action needed.
- **Snapshot export** (Settings screen): full JSON dump of all tables — useful for backup or
  moving data to another browser/machine.
- **Snapshot import**: replaces the entire DB; requires explicit user confirmation.
- **Data loss prevention**: browser's `beforeunload` event is NOT needed — IndexedDB writes
  are committed immediately on every operation.

---

## Non-Functional Requirements

### Performance

- Library grid must render smoothly up to 200 books (use CSS `object-fit` + lazy `loading`
  attribute on cover images, not canvas).
- Dexie queries must return results in < 100 ms for up to 200 books / 1000 quotes.

### Accessibility

- All interactive elements must be keyboard-navigable.
- MUI components used with correct ARIA roles.
- Color contrast must meet WCAG 2.1 AA.
- Modal dialogs must trap focus and restore it on close.

### Responsiveness

- Fully usable on viewport widths from 360 px (mobile) to 1440 px (desktop).
- Cover grid adapts: 1 col (< 600 px) / 2 cols (600–900 px) / 4 cols (> 900 px).

---

## Out of Scope for v1

- Global search across all books/quotes (v2).
- Dark mode (v2).
- PWA / service worker (v2).
- Keyboard shortcuts (v2).
- Undo/redo (v2).
- Social features or data sharing.
- Multiple user profiles.
- External book metadata lookup (ISBN APIs, etc.).
- Reading goals or streak tracking (v2).

---

## Implementation Plan

1. Scaffold: Vite + React + TypeScript + React Router + MUI + Zustand + Dexie + dexie-react-hooks + React Hook Form.
2. Define Dexie schema and typed entity interfaces.
3. Implement repositories (one per entity: books, sessions, quotes, ratings).
4. Build Library screen (grid + filters + empty state).
5. Build Book Detail screen (tabs: Progress, Sessions, Quotes, Rating).
6. Build Add/Edit Book screen.
7. Build Log Session screen.
8. Build Ranking screen.
9. Build Settings screen (export/import).
10. Polish: empty states, validation, responsive layout, accessibility pass.
