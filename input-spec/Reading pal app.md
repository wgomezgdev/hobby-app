# Reading pal app (React + In-memory DB)

## Overview

A **React** (web stack) version of the *reading companion app* concept, designed to be **100% self‑contained**: it runs locally on a single machine **with no external services**, using an **in‑memory database** inspired by **HBase** (a **column‑family** model).

## Purpose

A local app to:

- Manage a library of books (title, author, status, cover)
- Log reading sessions (progress, duration, notes)
- Save quotes (text, tags, favorite, page)
- Rate and rank books (1–5 stars, optional review)

## Hard constraints

- No remote backend (no Firebase, no Supabase, no external APIs).
- No “cloud storage”.
- Persistence: by default **in memory only**.
    - Optional: export/import a local snapshot file (JSON) so data isn’t lost on refresh/restart (still no services).

---

## Proposed stack

### Frontend

- **React + TypeScript**
- Routing: **React Router**
- UI: **Material UI (MUI)** or a lighter alternative (if you want minimal dependencies, use CSS + custom components)
- State: **Zustand** or **Redux Toolkit** (Zustand is simpler)

### Self-contained local runtime (recommended)

Option A (simplest “real app”, single installed app):

- **Tauri** (React UI + Rust backend) or **Electron**
- The in-memory DB lives inside the local app process
- Optional disk read/write for snapshots (local file)

Option B (pure web):

- React runs in the browser
- The in-memory DB lives in browser memory (lost on refresh)
- Optional snapshot export/import via download/upload of a JSON file (no servers)

> If “fully usable” means **keeping data across sessions**, the cleanest approach without services is **desktop (Tauri/Electron)** or local snapshot files.
> 

---

## Design: “HBase-like” in-memory DB

### Important note

Real HBase is distributed and persistent (HDFS), but we can **emulate the data model** in memory:

- **RowKey**: entity id (e.g., `book:uuid`)
- **Column families**: groups (e.g., `meta`, `progress`, `stats`)
- **Columns**: qualifiers within a family (e.g., `meta:title`)
- **Cell**: value + timestamp / optional versioning

### Minimal API

- `put(rowKey, family, qualifier, value, ts?)`
- `get(rowKey, family?, qualifier?)`
- `scan(prefixRowKey, filter?)`
- `delete(rowKey, family?, qualifier?)`
- In-memory secondary indexes for common queries (e.g., quotes by bookId, tags, favorites)

### Data structure (TypeScript)

- `Map<RowKey, Map<Family, Map<Qualifier, Cell>>>`
- `Cell = { value: unknown; ts: number }`
- Indexes:
    - `quotesByBook: Map<bookId, Set<quoteId>>`
    - `booksByStatus: Map<status, Set<bookId>>`
    - `quotesByTag: Map<tag, Set<quoteId>>`
    - `favoritesQuotes: Set<quoteId>`

---

## Domain model (entities)

### Book

- `id`
- `title`
- `author`
- `status`: `WANT_TO_READ | READING | FINISHED`
- `cover`: base64 (or a local path if desktop)
- `createdAt`, `updatedAt`

### ReadingSession

- `id`
- `bookId`
- `startedAt`
- `durationMinutes`
- `progressDelta` (pages or % — define a v1 standard)
- `notes?`

### Quote

- `id`
- `bookId`
- `text`
- `pageNumber?`
- `tags[]`
- `isFavorite`
- `createdAt`

### Rating

- `bookId`
- `stars` (1–5)
- `review?`
- `ratedAt`

---

## Key functional rules

### Progress

- For v1, pick **one standard**:
    - Recommended: **percentage** (0–100), simple and consistent
- A book becomes `FINISHED` if `progress >= 100`

### Covers

- Fully self-contained approach:
    - Store covers as **base64** (data URL) in memory
    - For grids/lists: generate thumbnails client-side (canvas) and cache them

### Quote search

- In-memory indexes:
    - by `bookId`
    - by `tag`
    - by `isFavorite`
- Text search:
    - simple: case-insensitive `includes()`
    - advanced: tokenization + basic scoring (no external libraries if you prefer)

---

## Project architecture (feature-first)

```
src/
  app/
    router/
    store/
    db/
  features/
    library/
    reading/
    quotes/
    ranking/
  shared/
    ui/
    utils/
    types/
```

### Layers

- UI (components)
- Use cases (actions)
- Repositories (bridge UI ↔ DB)
- DB (in-memory column-family store + indexes)

---

## Screens (usable MVP)

1. **Library**
    - Cover grid/list
    - Filters: status, sorting (recent, title, author)
    - CTA: “Add book”
2. **Book Detail**
    - Tabs: Progress / Sessions / Quotes / Ranking
3. **Add/Edit Book**
    - Form: title, author, status, cover
4. **Log Reading Session**
    - date/time, duration, delta/progress, notes
5. **Quotes**
    - List per book, search, tags, favorites
    - Modal: “Add quote”
6. **Ranking**
    - stars + review
    - views: top rated, recently finished

---

## Optional persistence (still no external services)

### Snapshot file (recommended)

- Export: serialize DB (and/or a normalized model) → JSON
- Import: load JSON → rebuild maps and indexes
- Desktop: write/read local filesystem
- Web: manual download/upload

> This keeps the default “in memory” requirement, while enabling real use across sessions without a backend.
> 

---

## Implementation plan (steps)

1) Scaffold React + TS + Router + UI

2) Implement the in-memory DB (core + indexes + tests)

3) Implement repositories: books, sessions, quotes, ratings

4) Build screens (Library → Book Detail → Quotes → Ranking)

5) Add snapshot export/import

6) Polish UX (empty states, validation, performance)

---

## Open questions (to lock the MVP)

- v1 progress: % or pages?
- Desktop (Tauri/Electron) or pure web?
- Covers: only local upload (file picker), or also local URL/path?