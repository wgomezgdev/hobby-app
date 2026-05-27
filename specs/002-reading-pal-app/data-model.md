# Data Model: Reading Pal

**Branch**: `002-reading-pal-app` | **Date**: 2026-05-26

---

## Entity Interfaces (`src/types/entities.ts`)

```typescript
export type BookStatus = 'WANT_TO_READ' | 'READING' | 'FINISHED';

export interface Book {
  id?: number;           // auto-increment primary key
  title: string;         // required
  author: string;        // required
  status: BookStatus;    // required; defaults to 'WANT_TO_READ' on add
  cover?: string;        // base64 data URL; absent → show placeholder
  currentProgress: number; // integer 0–100 (percentage)
  createdAt: number;     // Unix timestamp (ms)
  updatedAt: number;     // Unix timestamp (ms)
}

export interface ReadingSession {
  id?: number;
  bookId: number;        // FK → Book.id
  startedAt: number;     // Unix timestamp (ms); defaults to today
  durationMinutes: number;
  progressDelta: number; // percentage points added (0–100); capped in repo
  notes?: string;
}

export interface Quote {
  id?: number;
  bookId: number;        // FK → Book.id
  text: string;          // required
  pageNumber?: number;
  tags: string[];        // free-text; empty array if none
  isFavorite: boolean;   // defaults to false
  createdAt: number;     // Unix timestamp (ms)
}

export interface Rating {
  bookId: number;        // primary key — one rating per book
  stars: number;         // integer 1–5
  review?: string;
  ratedAt: number;       // Unix timestamp (ms)
}
```

---

## Dexie Schema (`src/db/db.ts`)

```typescript
import Dexie, { type Table } from 'dexie';
import type { Book, ReadingSession, Quote, Rating } from '../types/entities';

export class ReadingPalDB extends Dexie {
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
      ratings:  'bookId',
    });
  }
}

export const db = new ReadingPalDB();
```

---

## Index Rationale

| Table | Index | Query it supports |
|---|---|---|
| books | `status` | Filter by reading status |
| books | `title` | Sort A–Z by title |
| books | `author` | Sort A–Z by author |
| books | `createdAt` | Sort by most recent |
| sessions | `bookId` | Fetch sessions for a book |
| sessions | `startedAt` | Chronological ordering |
| quotes | `bookId` | Fetch quotes for a book |
| quotes | `isFavorite` | Filter by favorite |
| quotes | `*tags` | Multi-entry: filter by tag |
| ratings | `bookId` (PK) | One rating per book; fast lookup |

Full-text quote search (`String.includes()`) is done in memory after fetching by `bookId`;
no index needed for this volume.

---

## Relationships

```
Book (1) ──< ReadingSession (many)   bookId FK
Book (1) ──< Quote (many)            bookId FK
Book (1) ──| Rating (0 or 1)         bookId PK (unique per book)
```

Cascading deletes are handled in the repository layer — deleting a book also deletes its
sessions, quotes, and rating within a Dexie transaction.

---

## State Transitions (Book Status)

```
WANT_TO_READ
     │
     │  user edits status, or logs first session
     ▼
  READING
     │
     │  currentProgress reaches 100 (auto-transition in repo)
     ▼
 FINISHED
```

- Any status can be manually changed by the user via the Edit Book form.
- The auto-FINISHED transition fires only during `saveSession()` in the session repository.
- Progress is always capped: `currentProgress = Math.min(100, prev + delta)`.

---

## Validation Rules

| Field | Rule |
|---|---|
| Book.title | Required, non-empty string |
| Book.author | Required, non-empty string |
| Book.status | One of `WANT_TO_READ`, `READING`, `FINISHED` |
| Book.cover | Optional; if provided, must be base64 data URL; source file ≤ 1 MB |
| Book.currentProgress | Integer 0–100; enforced by repository (not form) |
| ReadingSession.durationMinutes | Required, integer ≥ 1 |
| ReadingSession.progressDelta | Required, integer 1–100 |
| Quote.text | Required, non-empty string |
| Rating.stars | Required, integer 1–5 |

---

## Snapshot Format (export/import)

```typescript
interface Snapshot {
  version: 1;
  exportedAt: number;    // Unix timestamp (ms)
  books: Book[];
  sessions: ReadingSession[];
  quotes: Quote[];
  ratings: Rating[];
}
```

Import replaces the entire DB within a single Dexie transaction (clear all tables, then
bulk-add from snapshot). Requires explicit user confirmation before executing.
