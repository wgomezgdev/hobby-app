# Research: Reading Pal

**Branch**: `002-reading-pal-app` | **Date**: 2026-05-26

All architectural decisions were pre-resolved through iterative spec refinement and encoded
in the constitution. This document records the decision rationale for traceability.

---

## Decision 1: Dexie.js v4 over raw IndexedDB

**Decision**: Use Dexie.js v4 as the IndexedDB abstraction layer.

**Rationale**:
- Raw IndexedDB has a verbose, callback-based API that is error-prone with TypeScript.
- Dexie provides a typed, promise-based API where each table is bound to an entity interface.
- Dexie v4 ships `liveQuery`, which produces observable queries that re-run automatically
  when underlying data changes — eliminating the need for manual cache invalidation.
- Index declaration is done once in the schema; Dexie maintains all secondary indexes
  automatically (no hand-rolled Maps needed).

**Alternatives considered**:
- Raw IndexedDB: rejected — too verbose, poor DX, no reactivity.
- PouchDB: rejected — adds CouchDB replication overhead not needed for a local-only app.
- localForage: rejected — key-value only, no relational queries or indexes.

---

## Decision 2: dexie-react-hooks (`useLiveQuery`) for all reads

**Decision**: All component data reads go through `useLiveQuery` from `dexie-react-hooks`.

**Rationale**:
- `useLiveQuery` returns `undefined` on the first render (loading state), then the query
  result, and re-renders automatically whenever the queried data changes.
- This replaces both `useEffect` + `useState` patterns and manual subscription management.
- It integrates correctly with React 18 concurrent mode.

**Pattern**:
```typescript
const books = useLiveQuery(() => db.books.toArray());
// books === undefined → show <Skeleton />
// books === [] → show empty state
// books.length > 0 → render grid
```

**Alternatives considered**:
- One-off `await` calls in `useEffect`: rejected — requires manual re-fetch on mutations,
  leads to stale UI, violates constitution principle II.

---

## Decision 3: Repository pattern for all writes

**Decision**: All database mutations go through repository functions; no component calls
Dexie directly.

**Rationale**:
- Business logic (progress cap, auto-FINISHED transition) is co-located with the data
  layer, not scattered across form handlers.
- Repositories are independently unit-testable with `fake-indexeddb`.
- Swapping the storage layer in the future only requires changing the repository, not every
  component.

**Example** (`bookRepository.ts`):
```typescript
export async function saveSession(session: Omit<ReadingSession, 'id'>): Promise<void> {
  const book = await db.books.get(session.bookId);
  if (!book) throw new Error('Book not found');
  const newProgress = Math.min(100, book.currentProgress + session.progressDelta);
  await db.transaction('rw', db.books, db.sessions, async () => {
    await db.sessions.add(session);
    await db.books.update(session.bookId, {
      currentProgress: newProgress,
      status: newProgress >= 100 ? 'FINISHED' : book.status,
      updatedAt: Date.now(),
    });
  });
}
```

---

## Decision 4: React Hook Form for all forms

**Decision**: Use React Hook Form for Add/Edit Book, Log Session, and Add Quote forms.

**Rationale**:
- Eliminates boilerplate controlled-component state for each field.
- Provides built-in validation with per-field error messages that integrate naturally
  with MUI's `error` and `helperText` props.
- Performance: only re-renders the changed field, not the whole form.

**Alternatives considered**:
- Plain controlled components with `useState`: rejected — verbose, no built-in validation
  integration, more error-prone for required-field enforcement.
- Formik: rejected — heavier API surface, slower than React Hook Form.

---

## Decision 5: Zustand for UI state only

**Decision**: Zustand manages filter chips, sort order, search query, and modal flags.
Nothing else.

**Rationale**:
- `useLiveQuery` already provides reactivity for persisted data, so a global store for
  server state is unnecessary.
- Zustand is simpler than Redux and has no boilerplate; ideal for small slices of
  ephemeral UI state that need to survive component unmounts (e.g., filter persists when
  navigating to a book detail and back).

---

## Decision 6: URL query params for Book Detail tab state

**Decision**: Active tab stored as `?tab=progress` (default), `?tab=sessions`,
`?tab=quotes`, `?tab=rating`.

**Rationale**:
- Browser back button navigates between tabs naturally.
- Deep links work (e.g., share a link directly to the Quotes tab).
- No extra Zustand slice needed.

---

## Decision 7: Base64 for cover images

**Decision**: Cover images stored as base64 data URLs in the `Book` entity.

**Rationale**:
- Dexie supports raw `Blob` storage, but Blobs do not serialize to JSON.
- Since snapshot export/import uses a JSON dump of all tables, base64 is required to make
  covers portable across the export/import cycle.
- Trade-off: ~1.33× storage overhead vs original file size. Acceptable for a personal
  local app with a 1 MB upload cap.

---

## Decision 8: fake-indexeddb for tests

**Decision**: All repository tests use `fake-indexeddb` to create an in-memory IndexedDB.

**Rationale**:
- Real browser IndexedDB is not available in Vitest's Node.js environment.
- `fake-indexeddb` is the standard solution; it implements the IndexedDB spec in memory
  and resets between tests cleanly.
- Each test file creates a fresh `Dexie` instance pointing to `fake-indexeddb` to ensure
  test isolation.

**Setup pattern**:
```typescript
import 'fake-indexeddb/auto';
import { ReadingPalDB } from '../src/db/db';

let db: ReadingPalDB;
beforeEach(() => { db = new ReadingPalDB(); });
afterEach(async () => { await db.delete(); });
```
